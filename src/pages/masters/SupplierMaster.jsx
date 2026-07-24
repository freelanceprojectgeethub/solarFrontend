import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Truck,
  X,
  Eye,
  Copy,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";

// State Code mapping for Indian GSTINs
const GST_STATE_CODES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "27": "Maharashtra", "29": "Karnataka", "30": "Goa", "32": "Kerala",
  "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh"
};

const getGSTState = (gstin) => {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  return GST_STATE_CODES[code] || null;
};

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
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

  const [inspectSupplier, setInspectSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    contactPerson: "",
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSuppliers = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/suppliers", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setSuppliers(data);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
      showToast("Failed to load supplier records", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = totalCount || suppliers.length;
    const active = suppliers.filter((s) => s.status !== "inactive").length;
    const gstCount = suppliers.filter((s) => s.gstNumber && s.gstNumber.trim().length === 15).length;
    const withContact = suppliers.filter((s) => s.phone || s.email || s.contactPerson).length;
    const contactRate = total > 0 ? Math.round((withContact / total) * 100) : 0;
    return { total, active, gstCount, contactRate };
  }, [suppliers, totalCount]);

  // Filtered & Sorted
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];
    if (statusFilter === "active") result = result.filter((s) => s.status !== "inactive");
    else if (statusFilter === "inactive") result = result.filter((s) => s.status === "inactive");

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [suppliers, statusFilter, sortBy]);

  const paginatedSuppliers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSuppliers.slice(start, start + limit);
  }, [filteredSuppliers, page, limit]);

  const computedTotalPages = Math.ceil(filteredSuppliers.length / limit) || 1;

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
      name: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      contactPerson: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setIsEditing(true);
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      gstNumber: supplier.gstNumber || "",
      contactPerson: supplier.contactPerson || "",
      status: supplier.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (supplier) => {
    const newStatus = supplier.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/suppliers/${supplier._id}`, { ...supplier, status: newStatus });
      showToast(`Supplier marked as ${newStatus}`);
      fetchSuppliers(true);
      if (inspectSupplier && inspectSupplier._id === supplier._id) {
        setInspectSupplier({ ...inspectSupplier, status: newStatus });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/suppliers/${deleteTarget._id}`);
      showToast("Supplier deleted successfully");
      if (inspectSupplier && inspectSupplier._id === deleteTarget._id) setInspectSupplier(null);
      setDeleteTarget(null);
      fetchSuppliers();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete supplier", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Supplier name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/suppliers/${editingId}`, formData);
        showToast("Supplier details updated!");
      } else {
        await api.post("/suppliers", formData);
        showToast("New vendor supplier registered!");
      }
      handleCloseModal();
      fetchSuppliers();
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
      name: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      contactPerson: "",
      status: "active",
    });
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  const exportToCSV = () => {
    if (suppliers.length === 0) {
      showToast("No supplier records to export", "error");
      return;
    }
    const headers = ["Supplier Name", "Contact Person", "Phone", "Email", "GSTIN", "Address", "Status"];
    const rows = suppliers.map((s) => [
      `"${s.name || ""}"`,
      `"${s.contactPerson || ""}"`,
      `"${s.phone || ""}"`,
      `"${s.email || ""}"`,
      `"${s.gstNumber || ""}"`,
      `"${s.address || ""}"`,
      `"${s.status || "active"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Suppliers_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported suppliers list to CSV!");
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
            Suppliers & Vendors
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Manage component suppliers, solar panel manufacturers, and vendor contacts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchSuppliers(true)}
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
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Suppliers */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Suppliers</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.total}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>Vendor Directory</div>
          </div>
        </div>

        {/* Card 2: Active Suppliers */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Suppliers</span>
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

        {/* Card 3: GST Registered */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>GST Registered</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(234,179,8,0.08)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.gstCount}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#d97706", marginTop: 2 }}>Verified Tax Profiles</div>
          </div>
        </div>

        {/* Card 4: Contact Coverage */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Coverage</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Phone size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.contactRate}%</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#2563eb", marginTop: 2 }}>With Phone / Email</div>
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
            placeholder="Search supplier name, GSTIN, phone..."
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
              All ({suppliers.length})
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
              Active ({stats.active})
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
            <Truck size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Suppliers...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Retrieving records from database</p>
        </div>
      ) : paginatedSuppliers.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Suppliers Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            {search || statusFilter !== "all"
              ? "No supplier records matched your search query or filter settings."
              : "No suppliers have been added yet. Click below to register your first supplier."}
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
              <span>Add Supplier</span>
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
                  <th style={{ padding: "14px 20px" }}>Supplier Name</th>
                  <th style={{ padding: "14px 20px" }}>Contact Details</th>
                  <th style={{ padding: "14px 20px" }}>GSTIN / Tax State</th>
                  <th style={{ padding: "14px 20px" }}>Contact Person</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedSuppliers.map((sup) => {
                  const stateName = getGSTState(sup.gstNumber);
                  return (
                    <tr
                      key={sup._id}
                      style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      {/* Supplier Name */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 11,
                              background: "linear-gradient(135deg, #FD4B23, #f59e0b)",
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
                            {sup.name ? sup.name.charAt(0).toUpperCase() : "S"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                              {sup.name}
                            </div>
                            {sup.address && (
                              <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                                {sup.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contacts */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {sup.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#111827" }}>
                              <Phone size={12} color="#9ca3af" />
                              <span>{sup.phone}</span>
                            </div>
                          )}
                          {sup.email && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
                              <Mail size={12} color="#9ca3af" />
                              <span>{sup.email}</span>
                            </div>
                          )}
                          {!sup.phone && !sup.email && <span style={{ color: "#9ca3af", fontStyle: "italic" }}>—</span>}
                        </div>
                      </td>

                      {/* GSTIN & State */}
                      <td style={{ padding: "14px 20px" }}>
                        {sup.gstNumber ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11, padding: "2px 6px", borderRadius: 6, backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", color: "#111827" }}>
                                {sup.gstNumber}
                              </span>
                              <button onClick={() => copyToClipboard(sup.gstNumber, "GSTIN")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 2 }}>
                                <Copy size={13} />
                              </button>
                            </div>
                            {stateName && <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, display: "block", marginTop: 2 }}>{stateName}</span>}
                          </div>
                        ) : (
                          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Unregistered</span>
                        )}
                      </td>

                      {/* Contact Person */}
                      <td style={{ padding: "14px 20px", fontWeight: 500, color: "#374151" }}>
                        {sup.contactPerson || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>—</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => handleToggleStatus(sup)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            border: sup.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                            backgroundColor: sup.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                            color: sup.status === "inactive" ? "#dc2626" : "#16a34a",
                            cursor: "pointer",
                          }}
                          title="Toggle status"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: sup.status === "inactive" ? "#ef4444" : "#22c55e" }} />
                          <span>{sup.status === "inactive" ? "Inactive" : "Active"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => setInspectSupplier(sup)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(sup)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(253,75,35,0.08)"; e.currentTarget.style.color = "#FD4B23"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Edit Supplier"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(sup)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                            title="Delete Supplier"
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
          {paginatedSuppliers.map((sup) => {
            const stateName = getGSTState(sup.gstNumber);
            return (
              <div
                key={sup._id}
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
                          background: "linear-gradient(135deg, #FD4B23, #f59e0b)",
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
                        {sup.name ? sup.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sup.name}
                        </h3>
                        {sup.contactPerson && (
                          <span style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <UserCheck size={12} />
                            {sup.contactPerson}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(sup)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 10,
                        fontWeight: 600,
                        border: sup.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                        backgroundColor: sup.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                        color: sup.status === "inactive" ? "#dc2626" : "#16a34a",
                        cursor: "pointer",
                      }}
                    >
                      {sup.status === "inactive" ? "Inactive" : "Active"}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", margin: "12px 0", fontSize: 12 }}>
                    {sup.phone && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af" }}>Phone</span>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{sup.phone}</span>
                      </div>
                    )}
                    {sup.email && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af" }}>Email</span>
                        <span style={{ fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{sup.email}</span>
                      </div>
                    )}
                    {sup.gstNumber && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af" }}>GSTIN</span>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 11, padding: "2px 6px", borderRadius: 6, backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", color: "#111827" }}>{sup.gstNumber}</span>
                      </div>
                    )}
                    {stateName && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#9ca3af" }}>State</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>{stateName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                  <button
                    onClick={() => setInspectSupplier(sup)}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Eye size={14} />
                    <span>Quick View</span>
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => handleEdit(sup)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(sup)}
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
          Showing {paginatedSuppliers.length} of {filteredSuppliers.length} suppliers (Page {page} of {computedTotalPages})
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
        {inspectSupplier && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setInspectSupplier(null)}
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
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #FD4B23, #f59e0b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                    {inspectSupplier.name ? inspectSupplier.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{inspectSupplier.name}</h3>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Supplier Vendor</span>
                  </div>
                </div>
                <button onClick={() => setInspectSupplier(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1, fontSize: 13 }}>
                {/* Status Card */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Status</span>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: inspectSupplier.status === "inactive" ? "#fef2f2" : "#f0fdf4", color: inspectSupplier.status === "inactive" ? "#dc2626" : "#16a34a", border: inspectSupplier.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                    {inspectSupplier.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={15} />
                    Contact Details
                  </h4>
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Contact Person</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectSupplier.contactPerson || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Phone Number</span>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{inspectSupplier.phone || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Email Address</span>
                      <span style={{ fontWeight: 500, color: "#374151" }}>{inspectSupplier.email || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* GST & Location */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#FD4B23", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={15} />
                    GSTIN & Address
                  </h4>
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>GSTIN Number</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>{inspectSupplier.gstNumber || "Unregistered"}</span>
                    </div>
                    {getGSTState(inspectSupplier.gstNumber) && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#6b7280" }}>Tax Jurisdiction</span>
                        <span style={{ fontWeight: 600, color: "#16a34a" }}>{getGSTState(inspectSupplier.gstNumber)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ color: "#6b7280", flexShrink: 0 }}>Registered Address</span>
                      <span style={{ fontWeight: 500, color: "#374151", textAlign: "right" }}>{inspectSupplier.address || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div style={{ paddingTop: 12, borderTop: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>System ID:</span>
                    <span style={{ fontFamily: "monospace", color: "#4b5563" }}>{inspectSupplier._id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Created:</span>
                    <span>{new Date(inspectSupplier.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Updated:</span>
                    <span>{new Date(inspectSupplier.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ padding: "16px 24px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
                <button
                  onClick={() => { const s = inspectSupplier; setInspectSupplier(null); handleEdit(s); }}
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
                  <span>Edit Supplier</span>
                </button>
                <button
                  onClick={() => { const s = inspectSupplier; setInspectSupplier(null); setDeleteTarget(s); }}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Delete Supplier"
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
                maxWidth: 540,
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
                    {isEditing ? "Edit Supplier Profile" : "Add New Supplier"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>
                    Configure vendor profile, contact & GST registration.
                  </p>
                </div>
                <button onClick={handleCloseModal} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Supplier / Company Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Vikram Solar Pvt Ltd"
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="e.g. Rajesh Kumar"
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
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
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
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="sales@supplier.com"
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
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        GSTIN Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="27AAAAA0000A1Z5"
                        maxLength={15}
                        style={{
                          width: "100%",
                          height: 42,
                          padding: "0 14px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          outline: "none",
                          color: "#111827",
                          fontWeight: 700,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full postal address..."
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

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Operational Status
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
                      <option value="active">Active Vendor</option>
                      <option value="inactive">Inactive / Suspended</option>
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
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Supplier"}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Delete Supplier?</h3>
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

export default SupplierMaster;
