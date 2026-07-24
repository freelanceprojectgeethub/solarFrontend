import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Ruler,
  X,
  Eye,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
} from "lucide-react";

const UnitMaster = () => {
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

  const [inspectUnit, setInspectUnit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUnits = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/units", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setUnits(data);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch units:", err);
      showToast("Failed to load unit records", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [search]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = totalCount || units.length;
    const active = units.filter((u) => u.status !== "inactive").length;
    const inactive = total - active;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, inactive, activeRate };
  }, [units, totalCount]);

  // Filtered & Sorted
  const filteredUnits = useMemo(() => {
    let result = [...units];
    if (statusFilter === "active") result = result.filter((u) => u.status !== "inactive");
    else if (statusFilter === "inactive") result = result.filter((u) => u.status === "inactive");

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [units, statusFilter, sortBy]);

  const paginatedUnits = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUnits.slice(start, start + limit);
  }, [filteredUnits, page, limit]);

  const computedTotalPages = Math.ceil(filteredUnits.length / limit) || 1;

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
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (unit) => {
    setIsEditing(true);
    setEditingId(unit._id);
    setFormData({
      name: unit.name || "",
      status: unit.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (unit) => {
    const newStatus = unit.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/units/${unit._id}`, { ...unit, status: newStatus });
      showToast(`Unit marked as ${newStatus}`);
      fetchUnits(true);
      if (inspectUnit && inspectUnit._id === unit._id) {
        setInspectUnit({ ...inspectUnit, status: newStatus });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/units/${deleteTarget._id}`);
      showToast("Unit deleted successfully");
      if (inspectUnit && inspectUnit._id === deleteTarget._id) setInspectUnit(null);
      setDeleteTarget(null);
      fetchUnits();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete unit", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Unit name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/units/${editingId}`, formData);
        showToast("Unit updated successfully!");
      } else {
        await api.post("/units", formData);
        showToast("New unit created successfully!");
      }
      handleCloseModal();
      fetchUnits();
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
      status: "active",
    });
  };

  const exportToCSV = () => {
    if (units.length === 0) {
      showToast("No unit records to export", "error");
      return;
    }
    const headers = ["Unit Name", "Status", "Created At"];
    const rows = units.map((u) => [
      `"${u.name || ""}"`,
      `"${u.status || "active"}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Units_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported units list to CSV!");
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
            Units of Measurement (UOM)
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Define measurement units like Pcs, Watt, kW, Meter, or Nos for inventory tracking and billing.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchUnits(true)}
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
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {/* Card 1: Total Units */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Units</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(253,75,35,0.08)", color: "#FD4B23", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ruler size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.total}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>UOM Definitions</div>
          </div>
        </div>

        {/* Card 2: Active Units */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Units</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(34,197,94,0.08)", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.active}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginTop: 2 }}>
              {stats.activeRate}% Operational
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Units */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Inactive Units</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.08)", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>{stats.inactive}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginTop: 2 }}>Archived Units</div>
          </div>
        </div>

        {/* Card 4: System Status */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Status</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(234,179,8,0.08)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={17} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>Ready</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#d97706", marginTop: 2 }}>Available for Invoicing</div>
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
            placeholder="Search units..."
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
              All ({units.length})
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
              Inactive ({stats.inactive})
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
            <Ruler size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Units...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Retrieving records from database</p>
        </div>
      ) : paginatedUnits.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ruler size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Units Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            {search || statusFilter !== "all"
              ? "No unit records matched your search query or filter settings."
              : "No units have been added yet. Click below to create your first unit."}
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
              <span>Add Unit</span>
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
                  <th style={{ padding: "14px 20px" }}>Unit Name / Symbol</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px" }}>Created Date</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedUnits.map((unit) => (
                  <tr
                    key={unit._id}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {/* Unit Symbol */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(245,158,11,0.2)",
                          }}
                        >
                          {unit.name ? unit.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: "#111827", fontSize: 14, fontFamily: "monospace" }}>
                            {unit.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 20px" }}>
                      <button
                        onClick={() => handleToggleStatus(unit)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          border: unit.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                          backgroundColor: unit.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                          color: unit.status === "inactive" ? "#dc2626" : "#16a34a",
                          cursor: "pointer",
                        }}
                        title="Toggle status"
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: unit.status === "inactive" ? "#ef4444" : "#22c55e" }} />
                        <span>{unit.status === "inactive" ? "Inactive" : "Active"}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 20px", color: "#6b7280", fontSize: 12 }}>
                      {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => setInspectUnit(unit)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#eff6ff"; e.currentTarget.style.color = "#2563eb"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Inspect Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(unit)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(253,75,35,0.08)"; e.currentTarget.style.color = "#FD4B23"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Edit Unit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(unit)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Delete Unit"
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
          {paginatedUnits.map((unit) => (
            <div
              key={unit._id}
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
                e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
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
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(245,158,11,0.2)",
                      }}
                    >
                      {unit.name ? unit.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "monospace" }}>
                        {unit.name}
                      </h3>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>Measurement Unit</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(unit)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 10,
                      fontWeight: 600,
                      border: unit.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                      backgroundColor: unit.status === "inactive" ? "#fef2f2" : "#f0fdf4",
                      color: unit.status === "inactive" ? "#dc2626" : "#16a34a",
                      cursor: "pointer",
                    }}
                  >
                    {unit.status === "inactive" ? "Inactive" : "Active"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                <button
                  onClick={() => setInspectUnit(unit)}
                  style={{ background: "none", border: "none", color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                >
                  <Eye size={14} />
                  <span>Quick View</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    onClick={() => handleEdit(unit)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(unit)}
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
          Showing {paginatedUnits.length} of {filteredUnits.length} units (Page {page} of {computedTotalPages})
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
        {inspectUnit && (
          <div style={{ position: "fixed", inset: 0, zIndex: 60, overflow: "hidden" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setInspectUnit(null)}
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
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
                    {inspectUnit.name ? inspectUnit.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "monospace" }}>{inspectUnit.name}</h3>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>Unit of Measurement</span>
                  </div>
                </div>
                <button onClick={() => setInspectUnit(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1, fontSize: 13 }}>
                {/* Status Card */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <span style={{ fontWeight: 600, color: "#374151" }}>Status</span>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: inspectUnit.status === "inactive" ? "#fef2f2" : "#f0fdf4", color: inspectUnit.status === "inactive" ? "#dc2626" : "#16a34a", border: inspectUnit.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                    {inspectUnit.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Timestamps */}
                <div style={{ paddingTop: 12, borderTop: "1px solid #f3f4f6", fontSize: 11, color: "#9ca3af", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>System ID:</span>
                    <span style={{ fontFamily: "monospace", color: "#4b5563" }}>{inspectUnit._id}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Created:</span>
                    <span>{new Date(inspectUnit.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Updated:</span>
                    <span>{new Date(inspectUnit.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ padding: "16px 24px", backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
                <button
                  onClick={() => { const u = inspectUnit; setInspectUnit(null); handleEdit(u); }}
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
                  <span>Edit Unit</span>
                </button>
                <button
                  onClick={() => { const u = inspectUnit; setInspectUnit(null); setDeleteTarget(u); }}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Delete Unit"
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
                maxWidth: 440,
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
                    {isEditing ? "Edit Measurement Unit" : "Add Measurement Unit"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>
                    Configure measurement symbol & status.
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
                      Unit Symbol / Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Pcs, Watt, kW, Meter, Box, Nos"
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
                    {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Unit"}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Delete Unit?</h3>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                Are you sure you want to delete <span style={{ fontWeight: 700, color: "#111827", fontFamily: "monospace" }}>"{deleteTarget.name}"</span>? This action cannot be undone.
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

export default UnitMaster;
