import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Percent,
  X,
  Eye,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Calculator,
} from "lucide-react";

const GstMaster = () => {
  const [gstList, setGstList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [inspectGst, setInspectGst] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    taxName: "",
    rate: "",
    type: "IGST",
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGst = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/gst", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setGstList(data);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch GST records:", err);
      showToast("Failed to load GST rate records", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGst();
  }, [search]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = totalCount || gstList.length;
    const active = gstList.filter((g) => g.status !== "inactive").length;
    const igstCount = gstList.filter((g) => g.type === "IGST").length;
    const cgstSgstCount = gstList.filter((g) => g.type === "CGST" || g.type === "SGST").length;
    return { total, active, igstCount, cgstSgstCount };
  }, [gstList, totalCount]);

  // Filtered & Sorted
  const filteredGst = useMemo(() => {
    let result = [...gstList];
    if (statusFilter === "active") result = result.filter((g) => g.status !== "inactive");
    else if (statusFilter === "inactive") result = result.filter((g) => g.status === "inactive");

    if (typeFilter !== "all") result = result.filter((g) => g.type === typeFilter);

    result.sort((a, b) => {
      if (sortBy === "rate_high") return (b.rate || 0) - (a.rate || 0);
      if (sortBy === "rate_low") return (a.rate || 0) - (b.rate || 0);
      if (sortBy === "name_asc") return a.taxName.localeCompare(b.taxName);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [gstList, statusFilter, typeFilter, sortBy]);

  const paginatedGst = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredGst.slice(start, start + limit);
  }, [filteredGst, page, limit]);

  const computedTotalPages = Math.ceil(filteredGst.length / limit) || 1;

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
      taxName: "",
      rate: "",
      type: "IGST",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (gst) => {
    setIsEditing(true);
    setEditingId(gst._id);
    setFormData({
      taxName: gst.taxName || "",
      rate: gst.rate ?? "",
      type: gst.type || "IGST",
      status: gst.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (gst) => {
    const newStatus = gst.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/gst/${gst._id}`, { ...gst, status: newStatus });
      showToast(`GST rate marked as ${newStatus}`);
      fetchGst(true);
      if (inspectGst && inspectGst._id === gst._id) {
        setInspectGst({ ...inspectGst, status: newStatus });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/gst/${deleteTarget._id}`);
      showToast("GST rate deleted successfully");
      if (inspectGst && inspectGst._id === deleteTarget._id) setInspectGst(null);
      setDeleteTarget(null);
      fetchGst();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete GST rate", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taxName.trim()) {
      showToast("Tax name is required", "error");
      return;
    }
    if (formData.rate === "" || Number(formData.rate) < 0) {
      showToast("Valid GST rate percentage is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        rate: Number(formData.rate),
      };
      if (isEditing) {
        await api.put(`/gst/${editingId}`, payload);
        showToast("GST rate updated!");
      } else {
        await api.post("/gst", payload);
        showToast("New GST rate created!");
      }
      handleCloseModal();
      fetchGst();
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
      taxName: "",
      rate: "",
      type: "IGST",
      status: "active",
    });
  };

  const exportToCSV = () => {
    if (gstList.length === 0) {
      showToast("No GST records to export", "error");
      return;
    }
    const headers = ["Tax Name", "Rate (%)", "Tax Type", "Status"];
    const rows = gstList.map((g) => [
      `"${g.taxName || ""}"`, `${g.rate ?? ""}`, `"${g.type || ""}"`, `"${g.status || "active"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `GstRates_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported GST rates to CSV!");
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
            GST Rates & Tax Configuration
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Define tax percentage rules (IGST, CGST, SGST) for automatic billing & invoicing calculations.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchGst(true)}
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
            <span>Add GST Rate</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Rates */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Tax Rules</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Percent size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.total}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>Configured Rules</div>
          </div>
        </div>

        {/* Card 2: Active Rules */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Rules</span>
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

        {/* Card 3: IGST Rates */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>IGST Rules</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(147,51,234,0.08)", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.igstCount}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9333ea", marginTop: 2 }}>Interstate Billing</div>
          </div>
        </div>

        {/* Card 4: CGST / SGST Rates */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>CGST / SGST</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.08)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.cgstSgstCount}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>Intrastate Billing</div>
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
            placeholder="Search tax name, rate %..."
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
          {/* Tax Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
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
            <option value="all">All Tax Types</option>
            <option value="IGST">IGST</option>
            <option value="CGST">CGST</option>
            <option value="SGST">SGST</option>
            <option value="CESS">CESS</option>
          </select>

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
              All ({gstList.length})
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
            <option value="rate_high">Rate: High–Low</option>
            <option value="rate_low">Rate: Low–High</option>
            <option value="name_asc">Name: A–Z</option>
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
            <Percent size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading GST Rates...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Retrieving records from database</p>
        </div>
      ) : paginatedGst.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Percent size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No GST Rates Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            {search || statusFilter !== "all" || typeFilter !== "all"
              ? "No GST rates matched your search query or filter settings."
              : "No GST rates have been added yet. Click below to create your first GST rate."}
          </p>
          {search || statusFilter !== "all" || typeFilter !== "all" ? (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
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
              <span>Add GST Rate</span>
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
                  <th style={{ padding: "14px 20px" }}>Tax Label</th>
                  <th style={{ padding: "14px 20px" }}>Rate %</th>
                  <th style={{ padding: "14px 20px" }}>Tax Type</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedGst.map((gst) => (
                  <tr
                    key={gst._id}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* Tax Label */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background: "linear-gradient(135deg, #9333ea, #6b21a8)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 13,
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(147,51,234,0.2)",
                          }}
                        >
                          {gst.rate}%
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                            {gst.taxName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rate Percentage */}
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#111827" }}>
                      {gst.rate}%
                    </td>

                    {/* Tax Type */}
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          backgroundColor: gst.type === "IGST" ? "#faf5ff" : gst.type === "CGST" ? "#eff6ff" : "#f0fdf4",
                          color: gst.type === "IGST" ? "#7e22ce" : gst.type === "CGST" ? "#1d4ed8" : "#15803d",
                          border: gst.type === "IGST" ? "1px solid #e9d5ff" : gst.type === "CGST" ? "1px solid #bfdbfe" : "1px solid #bbf7d0",
                        }}
                      >
                        {gst.type || "GST"}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggleStatus(gst)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          border: gst.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                          backgroundColor: gst.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                          color: gst.status === "inactive" ? "#dc2626" : "#16a34a",
                          cursor: "pointer",
                        }}
                        title="Toggle status"
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: gst.status === "inactive" ? "#ef4444" : "#22c55e" }} />
                        <span>{gst.status === "inactive" ? "Inactive" : "Active"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => setInspectGst(gst)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Inspect Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(gst)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(253,75,35,0.08)"; e.currentTarget.style.color = "#FD4B23"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Edit Rate"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(gst)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Delete Rate"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {paginatedGst.map((gst) => (
            <div
              key={gst._id}
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
                e.currentTarget.style.borderColor = "rgba(147,51,234,0.3)";
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
                        background: "linear-gradient(135deg, #9333ea, #6b21a8)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(147,51,234,0.2)",
                      }}
                    >
                      {gst.rate}%
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                        {gst.taxName}
                      </h3>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Tax Rule</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(gst)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                      border: gst.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                      backgroundColor: gst.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                      color: gst.status === "inactive" ? "#dc2626" : "#16a34a",
                      cursor: "pointer",
                    }}
                  >
                    {gst.status === "inactive" ? "Inactive" : "Active"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", margin: "12px 0", fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af" }}>Tax Rate</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#111827" }}>{gst.rate}%</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#9ca3af" }}>Tax Type</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, backgroundColor: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff" }}>
                      {gst.type}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                <button
                  onClick={() => setInspectGst(gst)}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Eye size={14} />
                  <span>Quick View</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => handleEdit(gst)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(gst)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          Showing {paginatedGst.length} of {filteredGst.length} GST rates (Page {page} of {computedTotalPages})
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
        {inspectGst && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setInspectGst(null)}
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
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #9333ea, #6b21a8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {inspectGst.rate}%
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{inspectGst.taxName}</h3>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>GST Tax Rule</span>
                  </div>
                </div>
                <button onClick={() => setInspectGst(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1, fontSize: 13 }}>
                {/* Status Card */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Status</span>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: inspectGst.status === "inactive" ? "#fef2f2" : "#f0fdf4", color: inspectGst.status === "inactive" ? "#dc2626" : "#16a34a", border: inspectGst.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                    {inspectGst.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Calculation Details */}
                <div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: "#9333ea", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: 6 }}>
                    <Calculator size={15} />
                    Tax Rule Specifications
                  </h4>
                  <div style={{ padding: 16, borderRadius: 12, backgroundColor: "#ffffff", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Tax Name</span>
                      <span style={{ fontWeight: 700, color: "#111827" }}>{inspectGst.taxName}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Percentage Rate</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#111827" }}>{inspectGst.rate}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#6b7280" }}>Tax Category</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, backgroundColor: "#faf5ff", color: "#7e22ce", border: "1px solid #e9d5ff" }}>{inspectGst.type}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div style={{ paddingTop: 12, borderTop: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>System ID:</span>
                    <span style={{ fontFamily: "monospace", color: "#4b5563" }}>{inspectGst._id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Created:</span>
                    <span>{new Date(inspectGst.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Updated:</span>
                    <span>{new Date(inspectGst.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ padding: "16px 24px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
                <button
                  onClick={() => { const g = inspectGst; setInspectGst(null); handleEdit(g); }}
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
                  <span>Edit Rate</span>
                </button>
                <button
                  onClick={() => { const g = inspectGst; setInspectGst(null); setDeleteTarget(g); }}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Delete Rate"
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
                maxWidth: 480,
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
                    {isEditing ? "Edit GST Tax Rate" : "Add GST Tax Rate"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>
                    Configure tax percentage rules for invoices.
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
                      Tax Label / Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="taxName"
                      required
                      value={formData.taxName}
                      onChange={handleInputChange}
                      placeholder="e.g. GST 18%, IGST 12%, Exempt 0%"
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
                        Rate Percentage (%) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="rate"
                        required
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.rate}
                        onChange={handleInputChange}
                        placeholder="18"
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
                          fontWeight: 700,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Tax Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
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
                        <option value="IGST">IGST (Interstate)</option>
                        <option value="CGST">CGST (Central)</option>
                        <option value="SGST">SGST (State)</option>
                        <option value="CESS">CESS (Sur-charge)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                      Status
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
                      <option value="active">Active</option>
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
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Rate"}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Delete GST Rate?</h3>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                Are you sure you want to delete <span style={{ fontWeight: 700, color: "#111827" }}>"{deleteTarget.taxName}"</span> ({deleteTarget.rate}%)? This action cannot be undone.
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

export default GstMaster;
