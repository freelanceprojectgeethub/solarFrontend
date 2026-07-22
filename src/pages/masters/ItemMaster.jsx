import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Search, Plus, Edit2, Trash2, Package, X, Eye, Copy, Download, RefreshCw,
  LayoutGrid, List, Tag, FolderTree, Ruler, CheckCircle2, XCircle,
  AlertTriangle, Hash, IndianRupee, Percent, BarChart3, TrendingUp,
  ShieldCheck, Briefcase, MapPin, Phone, Mail, ArrowUpDown, FileText
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
  const [limit] = useState(10);
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
    name: "", sku: "", brandId: "", categoryId: "", unitId: "",
    hsnCode: "", gstRate: "", sellingPrice: "", purchasePrice: "",
    description: "", status: "active",
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
    const total = items.length;
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
  }, [items]);

  // Filtered & Sorted
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
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-xl animate-slide-down ${
          toast.type === "error"
            ? "bg-red-950/95 border-red-500/40 text-red-200 ring-1 ring-red-500/20"
            : "bg-[#18181B]/95 border-[#FD4B23]/40 text-white ring-1 ring-[#FD4B23]/20"
        }`}>
          {toast.type === "error" ? <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-[#FD4B23] flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero */}
      <div className="dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111113] via-[#1A1A1A] to-[#251712] border border-white/[0.06] p-5 md:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold tracking-wider text-[#FFCE76] uppercase">Product Catalog</span>
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Item Master & Inventory</h1>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              Manage your product catalog — SKUs, pricing, HSN codes, tax rates, brands, and category classification.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => fetchItems(true)} disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FD4B23]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={exportToCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95">
              <Download className="w-4 h-4 text-[#FFCE76]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button onClick={handleOpenAddModal} className="btn-accent text-xs px-5 py-2.5 shadow-lg shadow-[#FD4B23]/30 hover:shadow-[#FD4B23]/50">
              <Plus className="w-4 h-4" /><span>Add Item</span>
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Items</span>
              <div className="w-8 h-8 rounded-lg bg-[#FD4B23]/20 text-[#FD4B23] flex items-center justify-center"><Package className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.total}</div>
            <div className="text-[11px] font-medium text-gray-400 mt-1">In Catalog</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Items</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.active}</div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Active</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Avg Margin</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFCE76]/20 text-[#FFCE76] flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.avgMargin}%</div>
            <div className="text-[11px] font-semibold text-[#FFCE76] mt-1">Profit Margin</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">HSN Mapped</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.withHsn}</div>
            <div className="text-[11px] font-medium text-gray-400 mt-1">Tax Classified</div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 md:p-4 rounded-xl border border-gray-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search item name, SKU, HSN..." value={search} onChange={handleSearchChange}
            className="input-field pl-10 pr-9 py-2.5 text-xs w-full bg-gray-50/80 focus:bg-white transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200 text-xs">
            <button onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>All ({items.length})</button>
            <button onClick={() => { setStatusFilter("active"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "active" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Active</button>
            <button onClick={() => { setStatusFilter("inactive"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "inactive" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Inactive</button>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-semibold bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#FD4B23] cursor-pointer transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="name_desc">Name: Z–A</option>
            <option value="price_high">Price: High–Low</option>
            <option value="price_low">Price: Low–High</option>
          </select>
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[#FD4B23] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-[#FD4B23] shadow-sm" : "text-gray-400 hover:text-gray-700"}`}><LayoutGrid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF0ED] text-[#FD4B23] mb-4 animate-bounce"><Package className="w-7 h-7" /></div>
          <h3 className="text-base font-bold text-gray-900">Loading Product Catalog...</h3>
          <p className="text-xs text-gray-400 mt-1">Fetching items and pricing data</p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto mb-4 flex items-center justify-center"><Package className="w-8 h-8" /></div>
          <h3 className="text-base font-bold text-gray-900">No Items Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            {search || statusFilter !== "all" ? "No items matched your search or filters." : "Add your first product to the catalog."}
          </p>
          {search || statusFilter !== "all" ? (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="btn-secondary text-xs px-4 py-2.5">Reset Filters</button>
          ) : (
            <button onClick={handleOpenAddModal} className="btn-accent text-xs px-5 py-2.5"><Plus className="w-4 h-4" /><span>Add Item</span></button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-[#FAFBFC] border-b border-[#EEF0F3] text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Product & SKU</th>
                  <th className="py-3.5 px-5">Brand / Category</th>
                  <th className="py-3.5 px-5">HSN & GST</th>
                  <th className="py-3.5 px-5 text-right">Purchase ₹</th>
                  <th className="py-3.5 px-5 text-right">Selling ₹</th>
                  <th className="py-3.5 px-5 text-right">Margin</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {paginatedItems.map((item) => {
                  const margin = getMargin(item);
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FD4B23] to-[#FFCE76] text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                            {item.name ? item.name.charAt(0).toUpperCase() : "I"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-[13px] group-hover:text-[#FD4B23] transition-colors truncate">{item.name}</div>
                            {item.sku && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200/80">{item.sku}</span>
                                <button onClick={() => copyToClipboard(item.sku, "SKU")} className="p-0.5 text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-1">
                          {item.brandId?.name && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/80">
                              <Tag className="w-3 h-3 text-gray-400" />{item.brandId.name}
                            </span>
                          )}
                          {item.categoryId?.name && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">
                              <FolderTree className="w-3 h-3" />{item.categoryId.name}
                            </span>
                          )}
                          {!item.brandId?.name && !item.categoryId?.name && <span className="text-gray-400 italic">—</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        {item.hsnCode ? (
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-gray-800 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200/80">{item.hsnCode}</span>
                            {item.gstRate != null && <div className="text-[10px] font-semibold text-emerald-700">{item.gstRate}% GST</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not Set</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-gray-600">{formatCurrency(item.purchasePrice)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-gray-900">{formatCurrency(item.sellingPrice)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`text-xs font-bold ${margin >= 20 ? "text-emerald-600" : margin >= 10 ? "text-yellow-600" : "text-red-500"}`}>{margin}%</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <button onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            item.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`} title="Toggle status">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === "inactive" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                          {item.status === "inactive" ? "Inactive" : "Active"}
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button onClick={() => setInspectItem(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedItems.map((item) => {
            const margin = getMargin(item);
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-lg hover:border-[#FD4B23]/20 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FD4B23] to-[#FFCE76] text-white flex items-center justify-center font-black text-base shadow-md shadow-[#FD4B23]/15 flex-shrink-0">
                        {item.name ? item.name.charAt(0).toUpperCase() : "I"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-[#FD4B23] transition-colors truncate">{item.name}</h3>
                        {item.sku && <span className="font-mono text-[10px] text-gray-400">{item.sku}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleToggleStatus(item)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                        item.status === "inactive" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>{item.status === "inactive" ? "Inactive" : "Active"}</button>
                  </div>
                  <div className="space-y-2 text-xs py-3 border-t border-b border-gray-100 my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Selling</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(item.sellingPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Purchase</span>
                      <span className="font-mono text-gray-600">{formatCurrency(item.purchasePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Margin</span>
                      <span className={`font-bold ${margin >= 20 ? "text-emerald-600" : margin >= 10 ? "text-yellow-600" : "text-red-500"}`}>{margin}%</span>
                    </div>
                    {item.hsnCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">HSN</span>
                        <span className="font-mono font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{item.hsnCode}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.brandId?.name && <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/80">{item.brandId.name}</span>}
                      {item.categoryId?.name && <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80">{item.categoryId.name}</span>}
                      {item.unitId?.name && <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200/80">{item.unitId.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setInspectItem(item)} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"><Eye className="w-3.5 h-3.5" /><span>View</span></button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">Showing {paginatedItems.length} of {filteredItems.length} items (Page {page} of {computedTotalPages})</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="px-3.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">{page} / {computedTotalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, computedTotalPages))} disabled={page === computedTotalPages || computedTotalPages === 0} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      {/* Inspection Drawer */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setInspectItem(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-slide-down">
              <div className="p-6 bg-gradient-to-r from-[#111113] to-[#1F1F1F] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FD4B23] text-white flex items-center justify-center font-black text-base shadow-md">
                    {inspectItem.name ? inspectItem.name.charAt(0).toUpperCase() : "I"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base line-clamp-1">{inspectItem.name}</h3>
                    <span className="text-[10px] text-gray-400">{inspectItem.sku || "No SKU"}</span>
                  </div>
                </div>
                <button onClick={() => setInspectItem(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs custom-scrollbar">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-700">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${inspectItem.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {inspectItem.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>
                <div className="space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#FD4B23] flex items-center gap-1.5"><IndianRupee className="w-4 h-4" />Pricing</h4>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2.5">
                    <div className="flex justify-between"><span className="text-gray-500">Selling Price</span><span className="font-mono font-bold text-gray-900">{formatCurrency(inspectItem.sellingPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Purchase Price</span><span className="font-mono font-semibold text-gray-700">{formatCurrency(inspectItem.purchasePrice)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-gray-100"><span className="text-gray-500">Margin</span><span className="font-bold text-emerald-600">{getMargin(inspectItem)}%</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#FD4B23] flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />Tax & Classification</h4>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2.5">
                    <div className="flex justify-between"><span className="text-gray-500">HSN Code</span><span className="font-mono font-bold text-gray-900">{inspectItem.hsnCode || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">GST Rate</span><span className="font-semibold text-gray-800">{inspectItem.gstRate != null ? `${inspectItem.gstRate}%` : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Brand</span><span className="font-semibold text-gray-800">{inspectItem.brandId?.name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-semibold text-gray-800">{inspectItem.categoryId?.name || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Unit</span><span className="font-semibold text-gray-800">{inspectItem.unitId?.name || "—"}</span></div>
                  </div>
                </div>
                {inspectItem.description && (
                  <div className="space-y-2">
                    <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#FD4B23] flex items-center gap-1.5"><FileText className="w-4 h-4" />Description</h4>
                    <p className="text-gray-600 leading-relaxed p-4 rounded-xl bg-gray-50 border border-gray-200">{inspectItem.description}</p>
                  </div>
                )}
                <div className="space-y-2 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <div className="flex justify-between"><span>Created:</span><span>{new Date(inspectItem.createdAt).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Updated:</span><span>{new Date(inspectItem.updatedAt).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
                <button onClick={() => { const i = inspectItem; setInspectItem(null); handleEdit(i); }} className="btn-accent text-xs flex-1 py-2.5"><Edit2 className="w-4 h-4" /><span>Edit Item</span></button>
                <button onClick={() => { const i = inspectItem; setInspectItem(null); setDeleteTarget(i); }} className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 pt-6 sm:pt-8 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-in my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-white flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{isEditing ? "Edit Catalog Item" : "Add New Catalog Item"}</h3>
                <p className="text-xs text-slate-500 mt-1">Configure product specifications, pricing model & inventory classification</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-7 space-y-6 text-xs overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Section 1: Identification Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FD4B23]"></span>
                    <span>Product Identification</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <label className="form-label">
                        <span>Item / Product Name</span>
                        <span className="form-label-req">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field font-medium text-sm"
                        placeholder="e.g. 550W Mono PERC Solar Panel"
                      />
                    </div>
                    <div>
                      <label className="form-label">SKU Code</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="input-field font-mono uppercase text-sm"
                        placeholder="SOL-550W-MP"
                      />
                    </div>
                    <div>
                      <label className="form-label">HSN Code</label>
                      <input
                        type="text"
                        name="hsnCode"
                        value={formData.hsnCode}
                        onChange={handleInputChange}
                        className="input-field font-mono text-sm"
                        placeholder="85414011"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Classification Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <span>Classification & Unit</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="form-label">Brand</label>
                      <select name="brandId" value={formData.brandId} onChange={handleInputChange} className="input-field font-medium cursor-pointer">
                        <option value="">Select Brand</option>
                        {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Category</label>
                      <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="input-field font-medium cursor-pointer">
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Unit</label>
                      <select name="unitId" value={formData.unitId} onChange={handleInputChange} className="input-field font-medium cursor-pointer">
                        <option value="">Select Unit</option>
                        {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Pricing & GST Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Pricing & Taxation</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="form-label">
                        <span>Purchase Price ₹</span>
                        <span className="form-label-req">*</span>
                      </label>
                      <input type="number" name="purchasePrice" required value={formData.purchasePrice} onChange={handleInputChange} className="input-field font-mono text-sm" placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="form-label">
                        <span>Selling Price ₹</span>
                        <span className="form-label-req">*</span>
                      </label>
                      <input type="number" name="sellingPrice" required value={formData.sellingPrice} onChange={handleInputChange} className="input-field font-mono text-sm" placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="form-label">GST Rate (%)</label>
                      <input type="number" name="gstRate" value={formData.gstRate} onChange={handleInputChange} className="input-field font-mono text-sm" placeholder="18" min="0" max="100" step="0.01" />
                    </div>
                  </div>
                  {formData.sellingPrice && formData.purchasePrice && Number(formData.sellingPrice) > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
                      <span>Calculated Margin:</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {Math.round(((Number(formData.sellingPrice) - Number(formData.purchasePrice)) / Number(formData.sellingPrice)) * 100)}% ({formatCurrency(Number(formData.sellingPrice) - Number(formData.purchasePrice))}/unit)
                      </span>
                    </div>
                  )}
                </div>

                {/* Section 4: Details & Status Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-5">
                  <div>
                    <label className="form-label">Description / Specifications</label>
                    <textarea name="description" rows="2" value={formData.description} onChange={handleInputChange} className="input-field" placeholder="Optional product description or tech specs..."></textarea>
                  </div>

                  <div>
                    <label className="form-label">Catalog Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="input-field font-medium cursor-pointer">
                      <option value="active">Active Item</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-7 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-accent text-xs px-6 py-2.5 shadow-md shadow-[#FD4B23]/25 disabled:opacity-50 flex items-center gap-2">
                  {submitting ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Saving...</span></> : isEditing ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-200/60 p-6 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto mb-4 flex items-center justify-center border border-red-100"><AlertTriangle className="w-7 h-7" /></div>
            <h3 className="text-base font-extrabold text-gray-900">Delete Item?</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.name}"</span>? This cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary text-xs flex-1 py-2.5">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all disabled:opacity-50">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMaster;
