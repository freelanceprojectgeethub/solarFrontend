import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Search, Plus, Edit2, Trash2, Landmark, X, Eye, Copy, Download, RefreshCw,
  LayoutGrid, List, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  CreditCard, Building, Lock
} from "lucide-react";

const maskAccountNumber = (accNo) => {
  if (!accNo) return "—";
  if (accNo.length <= 4) return accNo;
  return `•••• •••• ${accNo.slice(-4)}`;
};

const BankMaster = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [inspectBank, setInspectBank] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    ifscCode: "",
    branch: "",
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBanks = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/banks", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setBanks(data);
    } catch (err) {
      console.error("Failed to fetch banks:", err);
      showToast("Failed to load bank accounts", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [search]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = banks.length;
    const active = banks.filter((b) => b.status !== "inactive").length;
    const withIfsc = banks.filter((b) => b.ifscCode && b.ifscCode.trim()).length;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, withIfsc, activeRate };
  }, [banks]);

  // Filtered & Sorted
  const filteredBanks = useMemo(() => {
    let result = [...banks];
    if (statusFilter === "active") result = result.filter((b) => b.status !== "inactive");
    else if (statusFilter === "inactive") result = result.filter((b) => b.status === "inactive");

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.bankName.localeCompare(b.bankName);
      if (sortBy === "name_desc") return b.bankName.localeCompare(a.bankName);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return result;
  }, [banks, statusFilter, sortBy]);

  const paginatedBanks = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredBanks.slice(start, start + limit);
  }, [filteredBanks, page, limit]);

  const computedTotalPages = Math.ceil(filteredBanks.length / limit) || 1;

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
      bankName: "", accountNumber: "", accountHolder: "",
      ifscCode: "", branch: "", status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (bank) => {
    setIsEditing(true);
    setEditingId(bank._id);
    setFormData({
      bankName: bank.bankName || "",
      accountNumber: bank.accountNumber || "",
      accountHolder: bank.accountHolder || "",
      ifscCode: bank.ifscCode || "",
      branch: bank.branch || "",
      status: bank.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (bank) => {
    const newStatus = bank.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/banks/${bank._id}`, { ...bank, status: newStatus });
      showToast(`Bank account marked as ${newStatus}`);
      fetchBanks(true);
      if (inspectBank && inspectBank._id === bank._id) {
        setInspectBank({ ...inspectBank, status: newStatus });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/banks/${deleteTarget._id}`);
      showToast("Bank account deleted successfully");
      if (inspectBank && inspectBank._id === deleteTarget._id) setInspectBank(null);
      setDeleteTarget(null);
      fetchBanks();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete bank account", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bankName.trim()) {
      showToast("Bank name is required", "error");
      return;
    }
    if (!formData.accountNumber.trim()) {
      showToast("Account number is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/banks/${editingId}`, formData);
        showToast("Bank account details updated!");
      } else {
        await api.post("/banks", formData);
        showToast("New bank account registered!");
      }
      handleCloseModal();
      fetchBanks();
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
      bankName: "", accountNumber: "", accountHolder: "",
      ifscCode: "", branch: "", status: "active",
    });
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  const exportToCSV = () => {
    if (banks.length === 0) {
      showToast("No bank records to export", "error");
      return;
    }
    const headers = ["Bank Name", "Account Holder", "Account Number", "IFSC Code", "Branch", "Status"];
    const rows = banks.map((b) => [
      `"${b.bankName || ""}"`, `"${b.accountHolder || ""}"`, `"${b.accountNumber || ""}"`,
      `"${b.ifscCode || ""}"`, `"${b.branch || ""}"`, `"${b.status || "active"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `BankAccounts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported bank accounts to CSV!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Toast Notification */}
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

      {/* Hero Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111113] via-[#1A1A1A] to-[#251712] border border-white/[0.06] p-5 md:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Bank Accounts Master</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => fetchBanks(true)} disabled={refreshing}
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
              <Plus className="w-4 h-4" /><span>Add Bank Account</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-white/[0.06]">
          <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Accounts</span>
              <span className="text-base font-bold text-white font-mono">{stats.total}</span>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#FD4B23]/20 text-[#FD4B23] flex items-center justify-center flex-shrink-0">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Active Accounts</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white font-mono">{stats.active}</span>
                <span className="text-[10px] font-semibold text-emerald-400">({stats.activeRate}%)</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">IFSC Verified</span>
              <span className="text-base font-bold text-[#FFCE76] font-mono">{stats.withIfsc}</span>
            </div>
            <div className="w-7 h-7 rounded-md bg-[#FFCE76]/20 text-[#FFCE76] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Payment Ready</span>
              <span className="text-base font-bold text-blue-400 font-mono">Active</span>
            </div>
            <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-3.5 md:p-4 rounded-xl border border-gray-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search bank name, A/C number, IFSC..." value={search} onChange={handleSearchChange}
            className="input-field pl-10 pr-9 py-2.5 text-xs w-full bg-gray-50/80 focus:bg-white transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200 text-xs">
            <button onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>All ({banks.length})</button>
            <button onClick={() => { setStatusFilter("active"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "active" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Active ({stats.active})</button>
            <button onClick={() => { setStatusFilter("inactive"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "inactive" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>Inactive</button>
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF0ED] text-[#FD4B23] mb-4 animate-bounce"><Landmark className="w-7 h-7" /></div>
          <h3 className="text-base font-bold text-gray-900">Loading Bank Accounts...</h3>
          <p className="text-xs text-gray-400 mt-1">Retrieving banking records</p>
        </div>
      ) : paginatedBanks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto mb-4 flex items-center justify-center"><Landmark className="w-8 h-8" /></div>
          <h3 className="text-base font-bold text-gray-900">No Bank Accounts Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            {search || statusFilter !== "all" ? "No bank accounts match your current search or filter." : "Register company bank accounts for receiving payments and vendor payouts."}
          </p>
          {search || statusFilter !== "all" ? (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="btn-secondary text-xs px-4 py-2.5">Reset Filters</button>
          ) : (
            <button onClick={handleOpenAddModal} className="btn-accent text-xs px-5 py-2.5"><Plus className="w-4 h-4" /><span>Add Bank Account</span></button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#FAFBFC] border-b border-[#EEF0F3] text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Bank Name & Branch</th>
                  <th className="py-3.5 px-5">Account Number</th>
                  <th className="py-3.5 px-5">Account Holder</th>
                  <th className="py-3.5 px-5">IFSC Code</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {paginatedBanks.map((bank) => (
                  <tr key={bank._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-5 font-bold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-sm flex-shrink-0">
                          {bank.bankName ? bank.bankName.charAt(0).toUpperCase() : "B"}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] group-hover:text-blue-600 transition-colors truncate block">{bank.bankName}</span>
                          {bank.branch && <span className="text-[10px] text-gray-400 truncate block font-normal">{bank.branch} Branch</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900 text-xs">{maskAccountNumber(bank.accountNumber)}</span>
                        <button onClick={() => copyToClipboard(bank.accountNumber, "Account Number")} className="p-0.5 text-gray-400 hover:text-gray-600" title="Copy Full Account Number"><Copy className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-gray-800">
                      {bank.accountHolder || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="py-3.5 px-5">
                      {bank.ifscCode ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-gray-800 text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{bank.ifscCode}</span>
                          <button onClick={() => copyToClipboard(bank.ifscCode, "IFSC Code")} className="p-0.5 text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => handleToggleStatus(bank)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          bank.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        }`} title="Toggle status">
                        <span className={`w-1.5 h-1.5 rounded-full ${bank.status === "inactive" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                        {bank.status === "inactive" ? "Inactive" : "Active"}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button onClick={() => setInspectBank(bank)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleEdit(bank)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(bank)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
          {paginatedBanks.map((bank) => (
            <div key={bank._id} className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/15 flex-shrink-0">
                      {bank.bankName ? bank.bankName.charAt(0).toUpperCase() : "B"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">{bank.bankName}</h3>
                      {bank.branch && <span className="text-[10px] text-gray-400">{bank.branch} Branch</span>}
                    </div>
                  </div>
                  <button onClick={() => handleToggleStatus(bank)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                      bank.status === "inactive" ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>{bank.status === "inactive" ? "Inactive" : "Active"}</button>
                </div>
                <div className="space-y-2 text-xs py-3 border-t border-b border-gray-100 my-3">
                  <div className="flex items-center justify-between"><span className="text-gray-400">A/C Number</span><span className="font-mono font-bold text-gray-900">{maskAccountNumber(bank.accountNumber)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-400">A/C Holder</span><span className="font-medium text-gray-800 truncate max-w-[180px]">{bank.accountHolder || "—"}</span></div>
                  {bank.ifscCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">IFSC Code</span>
                      <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">{bank.ifscCode}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setInspectBank(bank)} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"><Eye className="w-3.5 h-3.5" /><span>View Details</span></button>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(bank)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(bank)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">Showing {paginatedBanks.length} of {filteredBanks.length} bank accounts (Page {page} of {computedTotalPages})</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <span className="px-3.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">{page} / {computedTotalPages}</span>
          <button onClick={() => setPage((p) => Math.min(p + 1, computedTotalPages))} disabled={page === computedTotalPages || computedTotalPages === 0} className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {inspectBank && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setInspectBank(null)}></div>
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-slide-down">
              <div className="p-6 bg-gradient-to-r from-[#111113] to-[#1F1F1F] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md">
                    {inspectBank.bankName ? inspectBank.bankName.charAt(0).toUpperCase() : "B"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base line-clamp-1">{inspectBank.bankName}</h3>
                    <span className="text-[10px] text-gray-400">Bank Account Details</span>
                  </div>
                </div>
                <button onClick={() => setInspectBank(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs custom-scrollbar">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-700">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${inspectBank.status === "inactive" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {inspectBank.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-blue-600 flex items-center gap-1.5"><CreditCard className="w-4 h-4" />Account Information</h4>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2.5">
                    <div className="flex justify-between items-center"><span className="text-gray-500">Account Holder</span><span className="font-bold text-gray-900">{inspectBank.accountHolder || "—"}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Account Number</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900">{inspectBank.accountNumber}</span>
                        <button onClick={() => copyToClipboard(inspectBank.accountNumber, "Account Number")} className="p-0.5 text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-blue-600 flex items-center gap-1.5"><Building className="w-4 h-4" />Branch & Routing</h4>
                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">IFSC Code</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">{inspectBank.ifscCode || "—"}</span>
                        {inspectBank.ifscCode && <button onClick={() => copyToClipboard(inspectBank.ifscCode, "IFSC Code")} className="p-0.5 text-gray-400 hover:text-gray-600"><Copy className="w-3 h-3" /></button>}
                      </div>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Branch Name</span><span className="font-medium text-gray-800">{inspectBank.branch || "—"}</span></div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <div className="flex justify-between"><span>System ID:</span><span className="font-mono text-gray-600">{inspectBank._id}</span></div>
                  <div className="flex justify-between"><span>Created At:</span><span>{new Date(inspectBank.createdAt).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Updated At:</span><span>{new Date(inspectBank.updatedAt).toLocaleString()}</span></div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
                <button onClick={() => { const b = inspectBank; setInspectBank(null); handleEdit(b); }} className="btn-accent text-xs flex-1 py-2.5"><Edit2 className="w-4 h-4" /><span>Edit Account</span></button>
                <button onClick={() => { const b = inspectBank; setInspectBank(null); setDeleteTarget(b); }} className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create & Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 pt-6 sm:pt-8 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-in my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-white flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{isEditing ? "Edit Bank Account" : "Add Bank Account"}</h3>
                <p className="text-xs text-slate-500 mt-1">Configure bank account details & IFSC routing information</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-7 space-y-6 text-xs overflow-y-auto flex-1 custom-scrollbar">
                
                {/* Section 1: Bank & Branch Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Bank & Branch Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">
                        <span>Bank Name</span>
                        <span className="form-label-req">*</span>
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        required
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className="input-field font-medium text-sm"
                        placeholder="e.g. HDFC Bank, ICICI Bank"
                      />
                    </div>
                    <div>
                      <label className="form-label">Branch Name</label>
                      <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="input-field font-medium text-sm"
                        placeholder="e.g. MG Road Branch"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Account Specs Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <span>Account Routing & Number</span>
                  </div>
                  <div>
                    <label className="form-label">
                      <span>Account Holder Name</span>
                      <span className="form-label-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountHolder"
                      required
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      className="input-field font-medium text-sm"
                      placeholder="e.g. Solar Enterprises Pvt Ltd"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">
                        <span>Account Number</span>
                        <span className="form-label-req">*</span>
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        required
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="input-field font-mono text-sm"
                        placeholder="50200012345678"
                      />
                    </div>
                    <div>
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        className="input-field font-mono uppercase text-sm tracking-wider"
                        placeholder="HDFC0001234"
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Status Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div>
                    <label className="form-label">Account Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field font-medium cursor-pointer"
                    >
                      <option value="active">Active Account</option>
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
                  {submitting ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Saving...</span></> : isEditing ? "Save Changes" : "Create Account"}
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
            <h3 className="text-base font-extrabold text-gray-900">Delete Bank Account?</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.bankName}"</span> ({maskAccountNumber(deleteTarget.accountNumber)})? This action cannot be undone.
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

export default BankMaster;
