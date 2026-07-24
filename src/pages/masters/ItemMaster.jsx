import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Eye,
  Copy,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  Tag,
  FolderTree,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  FileText,
} from "lucide-react";

const formatCurrency = (val) =>
  `₹${(Number(val) || 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [inspectItem, setInspectItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brandId: "",
    categoryId: "",
    unitId: "",
    hsnCode: "",
    gstRate: "",
    sellingPrice: "",
    purchasePrice: "",
    description: "",
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDropdowns = async () => {
    try {
      const [brandRes, catRes, unitRes] = await Promise.all([
        api.get("/brands?limit=100"),
        api.get("/categories?limit=100"),
        api.get("/units?limit=100"),
      ]);
      setBrands(brandRes.data.data || []);
      setCategories(catRes.data.data || []);
      setUnits(unitRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
    }
  };

  const fetchItems = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/items", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setItems(data);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      showToast("Failed to load item records", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchItems(); }, [search]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = totalCount || items.length;
    const active = items.filter((i) => i.status !== "inactive").length;
    const avgMargin = total > 0
      ? Math.round(items.reduce((sum, i) => {
        const margin = i.sellingPrice > 0
          ? ((i.sellingPrice - i.purchasePrice) / i.sellingPrice) * 100
          : 0;
        return sum + margin;
      }, 0) / total)
      : 0;
    const withHsn = items.filter((i) => i.hsnCode && i.hsnCode.trim()).length;
    return { total, active, avgMargin, withHsn };
  }, [items, totalCount]);

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (statusFilter === "active") result = result.filter((i) => i.status !== "inactive");
    else if (statusFilter === "inactive") result = result.filter((i) => i.status === "inactive");

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "price_high") return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      if (sortBy === "price_low") return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [items, statusFilter, sortBy]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, page, limit]);

  const computedTotalPages = Math.ceil(filteredItems.length / limit) || 1;

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "", sku: "", brandId: "", categoryId: "", unitId: "",
      hsnCode: "", gstRate: "", sellingPrice: "", purchasePrice: "",
      description: "", status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      brandId: item.brandId?._id || item.brandId || "",
      categoryId: item.categoryId?._id || item.categoryId || "",
      unitId: item.unitId?._id || item.unitId || "",
      hsnCode: item.hsnCode || "",
      gstRate: item.gstRate ?? "",
      sellingPrice: item.sellingPrice ?? "",
      purchasePrice: item.purchasePrice ?? "",
      description: item.description || "",
      status: item.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/items/${item._id}`, { ...item, brandId: item.brandId?._id || item.brandId, categoryId: item.categoryId?._id || item.categoryId, unitId: item.unitId?._id || item.unitId, status: newStatus });
      showToast(`Item marked as ${newStatus}`);
      fetchItems(true);
      if (inspectItem && inspectItem._id === item._id) setInspectItem({ ...inspectItem, status: newStatus });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/items/${deleteTarget._id}`);
      showToast("Item deleted successfully");
      if (inspectItem && inspectItem._id === deleteTarget._id) setInspectItem(null);
      setDeleteTarget(null);
      fetchItems();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete item", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { showToast("Item name is required", "error"); return; }
    if (!formData.sellingPrice) { showToast("Selling price is required", "error"); return; }
    if (!formData.purchasePrice) { showToast("Purchase price is required", "error"); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        brandId: formData.brandId || null,
        categoryId: formData.categoryId || null,
        unitId: formData.unitId || null,
        gstRate: formData.gstRate !== "" ? Number(formData.gstRate) : undefined,
        sellingPrice: Number(formData.sellingPrice),
        purchasePrice: Number(formData.purchasePrice),
      };
      if (isEditing) {
        await api.put(`/items/${editingId}`, payload);
        showToast("Item updated successfully!");
      } else {
        await api.post("/items", payload);
        showToast("New item added successfully!");
      }
      handleCloseModal();
      fetchItems();
    } catch (error) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "", sku: "", brandId: "", categoryId: "", unitId: "",
      hsnCode: "", gstRate: "", sellingPrice: "", purchasePrice: "",
      description: "", status: "active",
    });
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  const exportToCSV = () => {
    if (items.length === 0) { showToast("No data to export", "error"); return; }
    const headers = ["Name", "SKU", "Brand", "Category", "Unit", "HSN", "GST%", "Selling Price", "Purchase Price", "Status"];
    const rows = items.map((i) => [
      `"${i.name || ""}"`, `"${i.sku || ""}"`, `"${i.brandId?.name || ""}"`,
      `"${i.categoryId?.name || ""}"`, `"${i.unitId?.name || ""}"`,
      `"${i.hsnCode || ""}"`, i.gstRate ?? "", i.sellingPrice ?? "",
      i.purchasePrice ?? "", `"${i.status || "active"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Items_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Items exported to CSV!");
  };

  const getMargin = (item) => {
    if (!item.sellingPrice || item.sellingPrice <= 0) return 0;
    return Math.round(((item.sellingPrice - item.purchasePrice) / item.sellingPrice) * 100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }} className="pb-10 relative">
      {/* Toast Notification Floating Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 14,
              backgroundColor: toast.type === "error" ? "rgba(239,68,68,0.95)" : "rgba(18,18,22,0.95)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
              border: toast.type === "error" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(253,75,35,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            {toast.type === "error" ? (
              <XCircle size={18} color="#ffffff" />
            ) : (
              <CheckCircle2 size={18} color="#FD4B23" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title & Top Actions Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="md:!flex-row md:!items-center md:!justify-between">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em", margin: 0 }}>
            Items & Inventory
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Manage product catalog, SKUs, pricing models, HSN codes, and inventory rates.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchItems(true)}
            disabled={refreshing}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: refreshing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
            onMouseLeave={(e) => { if (!refreshing) e.currentTarget.style.backgroundColor = "#ffffff"; }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#FD4B23]" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
            title="Export CSV Report"
          >
            <Download size={14} color="#FD4B23" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(253,75,35,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(253,75,35,0.35)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 14px rgba(253,75,35,0.25)"}
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Items */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "16px 20px",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Items</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.total}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>In Catalog</div>
          </div>
        </div>

        {/* Card 2: Active Items */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "16px 20px",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Items</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(34,197,94,0.08)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.active}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginTop: 2 }}>
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Active
            </div>
          </div>
        </div>

        {/* Card 3: Avg Margin */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "16px 20px",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Margin</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(234,179,8,0.08)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.avgMargin}%</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#d97706", marginTop: 2 }}>Profit Margin</div>
          </div>
        </div>

        {/* Card 4: HSN Mapped */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "16px 20px",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>HSN Mapped</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.withHsn}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>Tax Classified</div>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "14px 18px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 260, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search item name, SKU, HSN..."
            value={search}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              height: 38,
              paddingLeft: 38,
              paddingRight: search ? 34 : 14,
              fontSize: 13,
              fontFamily: "'Inter', system-ui, sans-serif",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              outline: "none",
              color: "#111827",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(253,75,35,0.4)";
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 3px rgba(253,75,35,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Status Tabs */}
          <div style={{ display: "inline-flex", padding: 3, borderRadius: 10, backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: statusFilter === "all" ? "#ffffff" : "transparent",
                color: statusFilter === "all" ? "#111827" : "#6b7280",
                boxShadow: statusFilter === "all" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => { setStatusFilter("active"); setPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: statusFilter === "active" ? "#16a34a" : "transparent",
                color: statusFilter === "active" ? "#ffffff" : "#6b7280",
                boxShadow: statusFilter === "active" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.2s",
              }}
            >
              Active
            </button>
            <button
              onClick={() => { setStatusFilter("inactive"); setPage(1); }}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: statusFilter === "inactive" ? "#ef4444" : "transparent",
                color: statusFilter === "inactive" ? "#ffffff" : "#6b7280",
                boxShadow: statusFilter === "inactive" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.2s",
              }}
            >
              Inactive
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              height: 38,
              padding: "0 12px",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              color: "#374151",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="name_desc">Name: Z–A</option>
            <option value="price_high">Price: High–Low</option>
            <option value="price_low">Price: Low–High</option>
          </select>

          {/* View Mode Switcher */}
          <div style={{ display: "inline-flex", padding: 3, borderRadius: 10, backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb" }}>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "6px 8px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                backgroundColor: viewMode === "table" ? "#ffffff" : "transparent",
                color: viewMode === "table" ? "#FD4B23" : "#9ca3af",
                boxShadow: viewMode === "table" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                display: "flex",
                alignItems: "center",
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 8px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                color: viewMode === "grid" ? "#FD4B23" : "#9ca3af",
                boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                display: "flex",
                alignItems: "center",
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Catalog Items...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Fetching items and pricing data</p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Items Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            {search || statusFilter !== "all"
              ? "No items matched your search query or filter settings."
              : "No items have been added yet. Click below to create your first catalog item."}
          </p>
          {search || statusFilter !== "all" ? (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 10,
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          ) : (
            <button
              onClick={handleOpenAddModal}
              style={{
                height: 38,
                padding: "0 18px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* ENTERPRISE TABLE VIEW */
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Product & SKU</th>
                  <th style={{ padding: "14px 20px" }}>Brand / Category</th>
                  <th style={{ padding: "14px 20px" }}>HSN & GST</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Purchase ₹</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Selling ₹</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Margin</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedItems.map((item) => {
                  const margin = getMargin(item);
                  return (
                    <tr
                      key={item._id}
                      style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {/* Product Name & SKU */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 11,
                              background: "linear-gradient(135deg, #FD4B23, #FF8A5C)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                              boxShadow: "0 2px 8px rgba(253,75,35,0.2)",
                            }}
                          >
                            {item.name ? item.name.charAt(0).toUpperCase() : "I"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.name}
                            </div>
                            {item.sku && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#6b7280", backgroundColor: "#f3f4f6", padding: "1px 6px", borderRadius: 4, border: "1px solid #e5e7eb" }}>
                                  {item.sku}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(item.sku, "SKU")}
                                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2 }}
                                  title="Copy SKU"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Brand / Category */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {item.brandId?.name && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", backgroundColor: "#f3f4f6", padding: "1px 8px", borderRadius: 12, width: "fit-content", border: "1px solid #e5e7eb", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Tag size={11} color="#9ca3af" />
                              {item.brandId.name}
                            </span>
                          )}
                          {item.categoryId?.name && (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "1px 8px", borderRadius: 12, width: "fit-content", border: "1px solid #bfdbfe", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <FolderTree size={11} />
                              {item.categoryId.name}
                            </span>
                          )}
                          {!item.brandId?.name && !item.categoryId?.name && <span style={{ color: "#9ca3af", fontStyle: "italic" }}>—</span>}
                        </div>
                      </td>

                      {/* HSN & GST */}
                      <td style={{ padding: "14px 20px" }}>
                        {item.hsnCode ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "#1f2937", backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4, width: "fit-content" }}>
                              {item.hsnCode}
                            </span>
                            {item.gstRate != null && <span style={{ fontSize: 10, fontWeight: 600, color: "#16a34a" }}>{item.gstRate}% GST</span>}
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Not Set</span>
                        )}
                      </td>

                      {/* Purchase Price */}
                      <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#6b7280" }}>
                        {formatCurrency(item.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td style={{ padding: "14px 20px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                        {formatCurrency(item.sellingPrice)}
                      </td>

                      {/* Margin */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: margin >= 20 ? "#16a34a" : margin >= 10 ? "#d97706" : "#dc2626",
                            backgroundColor: margin >= 20 ? "#f0fdf4" : margin >= 10 ? "#fefce8" : "#fef2f2",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {margin}%
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            border: item.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                            backgroundColor: item.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                            color: item.status === "inactive" ? "#dc2626" : "#16a34a",
                            cursor: "pointer",
                          }}
                          title="Toggle status"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: item.status === "inactive" ? "#ef4444" : "#22c55e" }} />
                          <span>{item.status === "inactive" ? "Inactive" : "Active"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => setInspectItem(item)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(253,75,35,0.08)"; e.currentTarget.style.color = "#FD4B23"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Edit Item"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Delete Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {paginatedItems.map((item) => {
            const margin = getMargin(item);
            return (
              <div
                key={item._id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(253,75,35,0.3)";
                  e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #FD4B23, #FF8A5C)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16,
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(253,75,35,0.2)",
                        }}
                      >
                        {item.name ? item.name.charAt(0).toUpperCase() : "I"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </h3>
                        {item.sku && <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280" }}>{item.sku}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(item)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        border: item.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                        backgroundColor: item.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                        color: item.status === "inactive" ? "#dc2626" : "#16a34a",
                        cursor: "pointer",
                      }}
                    >
                      {item.status === "inactive" ? "Inactive" : "Active"}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", margin: "12px 0", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#9ca3af" }}>Selling Price</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>{formatCurrency(item.sellingPrice)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#9ca3af" }}>Purchase Price</span>
                      <span style={{ fontFamily: "monospace", color: "#6b7280" }}>{formatCurrency(item.purchasePrice)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ color: "#9ca3af" }}>Margin</span>
                      <span style={{ fontWeight: 700, color: margin >= 20 ? "#16a34a" : margin >= 10 ? "#d97706" : "#dc2626" }}>{margin}%</span>
                    </div>
                    {item.hsnCode && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af" }}>HSN Code</span>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1f2937", backgroundColor: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{item.hsnCode}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
                      {item.brandId?.name && <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 12 }}>{item.brandId.name}</span>}
                      {item.categoryId?.name && <span style={{ fontSize: 10, fontWeight: 600, color: "#1d4ed8", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: 12 }}>{item.categoryId.name}</span>}
                      {item.unitId?.name && <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", backgroundColor: "#f9fafb", padding: "2px 8px", borderRadius: 12 }}>{item.unitId.name}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                  <button
                    onClick={() => setInspectItem(item)}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Eye size={14} />
                    <span>Quick View</span>
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "12px 18px",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
          Showing {paginatedItems.length} of {filteredItems.length} items (Page {page} of {computedTotalPages})
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            Previous
          </button>

          <span style={{ fontSize: 12, fontWeight: 600, color: "#111827", padding: "0 8px" }}>
            {page} / {computedTotalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, computedTotalPages))}
            disabled={page === computedTotalPages || computedTotalPages === 0}
            style={{
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: (page === computedTotalPages || computedTotalPages === 0) ? "not-allowed" : "pointer",
              opacity: (page === computedTotalPages || computedTotalPages === 0) ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* INSPECTION SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {inspectItem && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setInspectItem(null)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                right: 0,
                width: "100%",
                maxWidth: 440,
                backgroundColor: "#ffffff",
                boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                zIndex: 61,
              }}
            >
              {/* Drawer Header */}
              <div style={{ padding: "20px 24px", background: "linear-gradient(180deg, #111113 0%, #1a1a1e 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #FD4B23, #e5401e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                    {inspectItem.name ? inspectItem.name.charAt(0).toUpperCase() : "I"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{inspectItem.name}</h3>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{inspectItem.sku || "No SKU"}</span>
                  </div>
                </div>
                <button onClick={() => setInspectItem(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1, fontSize: 13 }}>
                {/* Status Card */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Status</span>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: inspectItem.status === "inactive" ? "#fef2f2" : "#f0fdf4", color: inspectItem.status === "inactive" ? "#dc2626" : "#16a34a", border: inspectItem.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                    {inspectItem.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Pricing Card */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <IndianRupee size={15} />
                    Pricing & Margin
                  </h4>
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Selling Price</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>{formatCurrency(inspectItem.sellingPrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Purchase Price</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#4b5563" }}>{formatCurrency(inspectItem.purchasePrice)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
                      <span style={{ color: "#6b7280" }}>Profit Margin</span>
                      <span style={{ fontWeight: 700, color: "#16a34a" }}>{getMargin(inspectItem)}%</span>
                    </div>
                  </div>
                </div>

                {/* Tax & Classification Card */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={15} />
                    Tax & Classification
                  </h4>
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>HSN Code</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 6 }}>
                        {inspectItem.hsnCode || "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>GST Rate</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectItem.gstRate != null ? `${inspectItem.gstRate}%` : "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Brand</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectItem.brandId?.name || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Category</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectItem.categoryId?.name || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Unit</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectItem.unitId?.name || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {inspectItem.description && (
                  <div>
                    <h4 style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <FileText size={15} />
                      Description
                    </h4>
                    <p style={{ color: "#374151", margin: 0, padding: 14, borderRadius: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", lineHeight: 1.5 }}>
                      {inspectItem.description}
                    </p>
                  </div>
                )}

                {/* Timestamps */}
                <div style={{ paddingTop: 12, borderTop: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Created:</span>
                    <span>{new Date(inspectItem.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Updated:</span>
                    <span>{new Date(inspectItem.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ padding: "16px 24px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
                <button
                  onClick={() => { const item = inspectItem; setInspectItem(null); handleEdit(item); }}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit Item</span>
                </button>
                <button
                  onClick={() => { const item = inspectItem; setInspectItem(null); setDeleteTarget(item); }}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Delete Item"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE & EDIT FORM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 640,
                maxHeight: "90vh",
                backgroundColor: "#ffffff",
                borderRadius: 20,
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                zIndex: 61,
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: 0 }}>
                    {isEditing ? "Edit Catalog Item" : "Add New Catalog Item"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>
                    Configure product specifications, pricing model & inventory classification.
                  </p>
                </div>
                <button onClick={handleCloseModal} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1, fontSize: 13 }}>
                  {/* Item Name */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Item / Product Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. 550W Mono PERC Solar Panel"
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "0 14px",
                        fontSize: 13,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        outline: "none",
                        color: "#111827",
                        fontWeight: 500,
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                    />
                  </div>

                  {/* SKU & HSN Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        SKU Code
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="SOL-550W-MP"
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        HSN Code
                      </label>
                      <input
                        type="text"
                        name="hsnCode"
                        value={formData.hsnCode}
                        onChange={handleInputChange}
                        placeholder="85414011"
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                  </div>

                  {/* Brand, Category, Unit Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Brand
                      </label>
                      <select
                        name="brandId"
                        value={formData.brandId}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 10px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Category
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 10px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Unit
                      </label>
                      <select
                        name="unitId"
                        value={formData.unitId}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 10px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select Unit</option>
                        {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Prices & GST Rate Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Purchase Price ₹ <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="purchasePrice"
                        required
                        value={formData.purchasePrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Selling Price ₹ <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="sellingPrice"
                        required
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        GST Rate (%)
                      </label>
                      <input
                        type="number"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleInputChange}
                        placeholder="18"
                        min="0"
                        max="100"
                        step="0.01"
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                  </div>

                  {/* Calculated Margin Banner */}
                  {formData.sellingPrice && formData.purchasePrice && Number(formData.sellingPrice) > 0 && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Calculated Margin:</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#15803d" }}>
                        {Math.round(((Number(formData.sellingPrice) - Number(formData.purchasePrice)) / Number(formData.sellingPrice)) * 100)}% ({formatCurrency(Number(formData.sellingPrice) - Number(formData.purchasePrice))}/unit)
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Description / Tech Specs
                    </label>
                    <textarea
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Optional product specifications..."
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: 13,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        outline: "none",
                        color: "#111827",
                        resize: "vertical",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Catalog Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        height: 42,
                        padding: "0 14px",
                        fontSize: 13,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        outline: "none",
                        color: "#111827",
                        cursor: "pointer",
                      }}
                    >
                      <option value="active">Active Item</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: "14px 24px", backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      height: 38,
                      padding: "0 16px",
                      borderRadius: 10,
                      backgroundColor: "#ffffff",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      height: 38,
                      padding: "0 22px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.6 : 1,
                      boxShadow: "0 4px 12px rgba(253,75,35,0.25)",
                    }}
                  >
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Item"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setDeleteTarget(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 380,
                backgroundColor: "#ffffff",
                borderRadius: 20,
                padding: 24,
                textAlign: "center",
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                border: "1px solid #e5e7eb",
                zIndex: 61,
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#fef2f2", color: "#ef4444", margin: "0 auto 14px auto", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #fecaca" }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Delete Item?</h3>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                Are you sure you want to delete <span style={{ fontWeight: 700, color: "#111827" }}>"{deleteTarget.name}"</span>? This action cannot be undone.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, height: 38, borderRadius: 10, backgroundColor: "#ffffff", border: "1px solid #d1d5db", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  style={{ flex: 1, height: 38, borderRadius: 10, border: "none", backgroundColor: "#dc2626", color: "#ffffff", fontSize: 12, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1 }}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemMaster;
