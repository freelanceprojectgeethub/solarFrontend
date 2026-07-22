import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Search, Plus, Edit2, Trash2, Ruler, X, Eye, Copy, Download, RefreshCw,
  LayoutGrid, List, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Calendar, Clock, Sparkles, Scale
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
  const [limit] = useState(10);
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
    const total = units.length;
    const active = units.filter((u) => u.status !== "inactive").length;
    const inactive = total - active;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, inactive, activeRate };
  }, [units]);

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
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-xl animate-slide-down ${toast.type === "error"
            ? "bg-red-950/95 border-red-500/40 text-red-200 ring-1 ring-red-500/20"
            : "bg-[#18181B]/95 border-[#FD4B23]/40 text-white ring-1 ring-[#FD4B23]/20"
          }`}>
          {toast.type === "error" ? <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-[#FD4B23] flex-shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111113] via-[#1A1A1A] to-[#251712] border border-white/[0.06] p-5 md:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Units of Measurement (UOM)</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => fetchUnits(true)} disabled={refreshing}
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
              <Plus className="w-4 h-4" /><span>Add Unit</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Units</span>
              <div className="w-8 h-8 rounded-lg bg-[#FD4B23]/20 text-[#FD4B23] flex items-center justify-center"><Ruler className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.total}</div>
            <div className="text-[11px] font-medium text-gray-400 mt-1">UOM Definitions</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Units</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.active}</div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1">{stats.activeRate}% Operational</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Inactive Units</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center"><XCircle className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">{stats.inactive}</div>
            <div className="text-[11px] font-medium text-gray-400 mt-1">Archived Units</div>
          </div>
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">System Status</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFCE76]/20 text-[#FFCE76] flex items-center justify-center"><Scale className="w-4 h-4" /></div>
            </div>
            <div className="text-xl md:text-2xl font-extrabold text-white">Active</div>
            <div className="text-[11px] font-semibold text-[#FFCE76] mt-1">Ready for Billing</div>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-3.5 md:p-4 rounded-xl border border-gray-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search units..." value={search} onChange={handleSearchChange}
            className="input-field pl-10 pr-9 py-2.5 text-xs w-full bg-gray-50/80 focus:bg-white transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200 text-xs">
            <button onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>All ({units.length})</button>
            <button onClick={() => { setStatusFilter("active"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "active" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Active ({stats.active})</button>
            <button onClick={() => { setStatusFilter("inactive"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "inactive" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Inactive ({stats.inactive})</button>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-semibold bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#FD4B23] cursor-pointer transition-colors">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A–Z</option>
            <option value="name_desc">Name: Z–A</option>
          </select>
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200">
            <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[#FD4B23] shadow-sm" : "text-gray-400 hover:text-gray-700"}`} title="Table View"><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-[#FD4B23] shadow-sm" : "text-gray-400 hover:text-gray-700"}`} title="Grid View"><LayoutGrid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF0ED] text-[#FD4B23] mb-4 animate-bounce"><Ruler className="w-7 h-7" /></div>
          <h3 className="text-base font-bold text-gray-900">Loading Units...</h3>
          <p className="text-xs text-gray-400 mt-1">Retrieving measurement unit records</p>
        </div>
      ) : paginatedUnits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto mb-4 flex items-center justify-center"><Ruler className="w-8 h-8" /></div>
          <h3 className="text-base font-bold text-gray-900">No Units Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            {search || statusFilter !== "all" ? "No units match your current search or filter." : "Add measurement units like Pcs, Watt, kW, or Nos to standardize item billing."}
          </p>
          {search || statusFilter !== "all" ? (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="btn-secondary text-xs px-4 py-2.5">Reset Filters</button>
          ) : (
            <button onClick={handleOpenAddModal} className="btn-accent text-xs px-5 py-2.5"><Plus className="w-4 h-4" /><span>Add Unit</span></button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#FAFBFC] border-b border-[#EEF0F3] text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Unit Name</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {paginatedUnits.map((unit) => (
                  <tr key={unit._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-5 font-bold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                          {unit.name ? unit.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] group-hover:text-[#FD4B23] transition-colors truncate block font-mono">{unit.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => handleToggleStatus(unit)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${unit.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`} title="Toggle status">
                        <span className={`w-1.5 h-1.5 rounded-full ${unit.status === "inactive" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                        {unit.status === "inactive" ? "Inactive" : "Active"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 font-medium">
                      {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button onClick={() => setInspectUnit(unit)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(unit)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors" title="Edit Unit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(unit)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Unit"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedUnits.map((unit) => (
            <div key={unit._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-lg hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-amber-500/15 flex-shrink-0">
                      {unit.name ? unit.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-[#FD4B23] transition-colors truncate font-mono">{unit.name}</h3>
                      <span className="text-[10px] text-gray-400">Measurement Unit</span>
                    </div>
                  </div>
                  <button onClick={() => handleToggleStatus(unit)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${unit.status === "inactive" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>{unit.status === "inactive" ? "Inactive" : "Active"}</button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                <button onClick={() => setInspectUnit(unit)} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"><Eye className="w-3.5 h-3.5" /><span>View Details</span></button>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(unit)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(unit)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">Showing {paginatedUnits.length} of {filteredUnits.length} units (Page {page} of {computedTotalPages})</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="px-3.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">{page} / {computedTotalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, computedTotalPages))} disabled={page === computedTotalPages || computedTotalPages === 0} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {inspectUnit && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setInspectUnit(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-slide-down">
              <div className="p-6 bg-gradient-to-r from-[#111113] to-[#1F1F1F] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-md">
                    {inspectUnit.name ? inspectUnit.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base font-mono line-clamp-1">{inspectUnit.name}</h3>
                    <span className="text-[10px] text-gray-400">Unit of Measurement</span>
                  </div>
                </div>
                <button onClick={() => setInspectUnit(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs custom-scrollbar">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-700">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${inspectUnit.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {inspectUnit.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                  <div className="flex justify-between"><span>System ID:</span><span className="font-mono text-gray-600">{inspectUnit._id}</span></div>
                  <div className="flex justify-between"><span>Created At:</span><span>{new Date(inspectUnit.createdAt).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Updated At:</span><span>{new Date(inspectUnit.updatedAt).toLocaleString()}</span></div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
                <button onClick={() => { const u = inspectUnit; setInspectUnit(null); handleEdit(u); }} className="btn-accent text-xs flex-1 py-2.5"><Edit2 className="w-4 h-4" /><span>Edit Unit</span></button>
                <button onClick={() => { const u = inspectUnit; setInspectUnit(null); setDeleteTarget(u); }} className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create & Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 pt-6 sm:pt-8 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-in my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-white flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{isEditing ? "Edit Measurement Unit" : "Add Measurement Unit"}</h3>
                <p className="text-xs text-slate-500 mt-1">Specify unit symbol for stock tracking and billing</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-7 space-y-6 text-xs overflow-y-auto flex-1 custom-scrollbar">

                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div>
                    <label className="form-label">
                      <span>Unit Symbol / Name</span>
                      <span className="form-label-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field font-mono font-semibold text-sm"
                      placeholder="e.g. Pcs, Watt, kW, Meter, Box, Set, Nos"
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field font-medium cursor-pointer"
                    >
                      <option value="active">Active</option>
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
                  {submitting ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Saving...</span></> : isEditing ? "Save Changes" : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-200/60 p-6 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto mb-4 flex items-center justify-center border border-red-100"><AlertTriangle className="w-7 h-7" /></div>
            <h3 className="text-base font-extrabold text-gray-900">Delete Unit?</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900 font-mono">"{deleteTarget.name}"</span>? This action cannot be undone.
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

export default UnitMaster;
