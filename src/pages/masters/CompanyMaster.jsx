import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  X,
  Eye,
  Copy,
  Check,
  Download,
  RefreshCw,
  LayoutGrid,
  List,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  Building,
  Hash,
  Clock,
  Briefcase,
  Calendar,
  Filter
} from "lucide-react";

// State Code mapping for Indian GSTINs
const GST_STATE_CODES = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "28": "Andhra Pradesh (Old)",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "Ladakh",
};

const getGSTState = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 2) return null;
  const code = gstNumber.substring(0, 2);
  return GST_STATE_CODES[code] || "India";
};

const isValidGSTIN = (gst) => {
  if (!gst) return false;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.trim().toUpperCase());
};

const CompanyMaster = () => {
  // Main Data States
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'name_asc', 'name_desc'
  const [viewMode, setViewMode] = useState("table"); // 'table', 'grid'

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal & Drawer States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Drawer Inspection State
  const [inspectCompany, setInspectCompany] = useState(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Copy Feedback Toast
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    status: "active",
  });

  const showToastNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCompanies = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get("/companies", {
        params: { page, limit: 50, search }, // Fetch up to 50 for client sorting/kpi accuracy
      });
      const data = res.data.data || [];
      setCompanies(data);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      showToastNotification(
        err.response?.data?.message || "Failed to load company records",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  // Derived KPI Stats
  const stats = useMemo(() => {
    const total = totalCount || companies.length;
    const active = companies.filter((c) => c.status !== "inactive").length;
    const gstCount = companies.filter((c) => c.gstNumber && c.gstNumber.trim().length > 0).length;
    const contactComplete = companies.filter(
      (c) => (c.phone && c.phone.trim()) || (c.email && c.email.trim())
    ).length;
    const contactRate = total > 0 ? Math.round((contactComplete / total) * 100) : 0;

    return { total, active, gstCount, contactRate };
  }, [companies, totalCount]);

  // Filtered & Sorted Companies
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Status Filter
    if (statusFilter === "active") {
      result = result.filter((c) => c.status !== "inactive");
    } else if (statusFilter === "inactive") {
      result = result.filter((c) => c.status === "inactive");
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [companies, statusFilter, sortBy]);

  // Paginated Subset
  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredCompanies.slice(start, start + limit);
  }, [filteredCompanies, page, limit]);

  const computedTotalPages = Math.ceil(filteredCompanies.length / limit) || 1;

  // Form Handlers
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
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (company) => {
    setIsEditing(true);
    setEditingId(company._id);
    setFormData({
      name: company.name || "",
      email: company.email || "",
      phone: company.phone || "",
      address: company.address || "",
      gstNumber: company.gstNumber || "",
      status: company.status || "active",
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (company) => {
    const newStatus = company.status === "inactive" ? "active" : "inactive";
    try {
      await api.put(`/companies/${company._id}`, {
        ...company,
        status: newStatus,
      });
      showToastNotification(
        `Company marked as ${newStatus === "active" ? "Active" : "Inactive"}`
      );
      fetchCompanies(true);
      if (inspectCompany && inspectCompany._id === company._id) {
        setInspectCompany({ ...inspectCompany, status: newStatus });
      }
    } catch (err) {
      showToastNotification(
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/companies/${deleteTarget._id}`);
      showToastNotification("Company deleted successfully");
      if (inspectCompany && inspectCompany._id === deleteTarget._id) {
        setInspectCompany(null);
      }
      setDeleteTarget(null);
      fetchCompanies();
    } catch (error) {
      showToastNotification(
        error.response?.data?.message || "Failed to delete company",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToastNotification("Company Name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/companies/${editingId}`, formData);
        showToastNotification("Company profile updated successfully!");
      } else {
        await api.post("/companies", formData);
        showToastNotification("New Enterprise Company added successfully!");
      }
      handleCloseModal();
      fetchCompanies();
    } catch (error) {
      showToastNotification(
        error.response?.data?.message || "Operation failed. Please try again.",
        "error"
      );
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
      status: "active",
    });
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToastNotification(`${label} copied to clipboard!`);
  };

  const exportToCSV = () => {
    if (companies.length === 0) {
      showToastNotification("No company data available to export.", "error");
      return;
    }
    const headers = ["Company Name", "Email", "Phone", "GSTIN", "Status", "Address"];
    const rows = companies.map((c) => [
      `"${c.name || ""}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.gstNumber || ""}"`,
      `"${c.status || "active"}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Companies_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToastNotification("Exported company dataset to CSV!");
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Toast Notification Floating Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-xl animate-slide-down ${toast.type === "error"
              ? "bg-red-950/95 border-red-500/40 text-red-200 ring-1 ring-red-500/20"
              : "bg-[#18181B]/95 border-[#FD4B23]/40 text-white ring-1 ring-[#FD4B23]/20"
            }`}
        >
          {toast.type === "error" ? (
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#FD4B23] flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header & Executive Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111113] via-[#1A1A1A] to-[#251712] border border-white/[0.06] p-5 md:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Company Master & Profiles
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchCompanies(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FD4B23]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95"
              title="Export CSV Report"
            >
              <Download className="w-4 h-4 text-[#FFCE76]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="btn-accent text-xs px-5 py-2.5 shadow-lg shadow-[#FD4B23]/30 hover:shadow-[#FD4B23]/50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 pt-5 border-t border-white/[0.06]">
          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Companies</span>
              <div className="w-8 h-8 rounded-lg bg-[#FD4B23]/20 text-[#FD4B23] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-white">{stats.total}</div>
              <div className="text-[11px] font-medium text-gray-400 mt-1">Master Records</div>
            </div>
          </div>

          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Entities</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-white">{stats.active}</div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Active Operating
              </div>
            </div>
          </div>

          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">GST Registered</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFCE76]/20 text-[#FFCE76] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-white">{stats.gstCount}</div>
              <div className="text-[11px] font-semibold text-[#FFCE76] mt-1">Tax Verified Profiles</div>
            </div>
          </div>

          <div className="p-3.5 md:p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Contact Coverage</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-extrabold text-white">{stats.contactRate}%</div>
              <div className="text-[11px] font-medium text-gray-400 mt-1">With Phone or Email</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-3.5 md:p-4 rounded-xl border border-gray-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company name, email, phone, GSTIN..."
            value={search}
            onChange={handleSearchChange}
            className="input-field pl-10 pr-9 py-2.5 text-xs w-full bg-gray-50/80 focus:bg-white transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Controls: Filters, Sort & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          {/* Status Filter Pill Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200 text-xs">
            <button
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter("active");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "active"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => {
                setStatusFilter("inactive");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${statusFilter === "inactive"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Inactive ({companies.length - stats.active})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-semibold bg-gray-50/80 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#FD4B23] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="inline-flex p-1 rounded-xl bg-gray-100/90 border border-gray-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table"
                  ? "bg-white text-[#FD4B23] shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
                }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid"
                  ? "bg-white text-[#FD4B23] shadow-sm"
                  : "text-gray-400 hover:text-gray-700"
                }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF0ED] text-[#FD4B23] mb-4 animate-bounce">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Loading Enterprise Companies...</h3>
          <p className="text-xs text-gray-400 mt-1">Retrieving database records and tax profiles</p>
        </div>
      ) : paginatedCompanies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200/80 p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 mx-auto mb-4 flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Companies Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1.5 mb-6 leading-relaxed">
            {search || statusFilter !== "all"
              ? "No company records matched your search query or filter settings."
              : "No companies have been added yet. Click below to add your first company master record."}
          </p>
          {search || statusFilter !== "all" ? (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="btn-secondary text-xs px-4 py-2.5"
            >
              Reset Search & Filters
            </button>
          ) : (
            <button onClick={handleOpenAddModal} className="btn-accent text-xs px-5 py-2.5">
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* ENTERPRISE TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-gray-200/90 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Company & Profile</th>
                  <th className="py-4 px-6">GSTIN & State</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Registered Address</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {paginatedCompanies.map((company) => {
                  const gstState = getGSTState(company.gstNumber);
                  return (
                    <tr
                      key={company._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Company Name & Badge */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FD4B23] to-[#FFCE76] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#FD4B23]/15 flex-shrink-0">
                            {company.name ? company.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 text-sm group-hover:text-[#FD4B23] transition-colors truncate">
                              {company.name}
                            </div>
                            <span className="text-[10px] font-medium text-gray-400">
                              Added {new Date(company.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* GSTIN & State */}
                      <td className="py-4 px-6">
                        {company.gstNumber ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-gray-800 text-xs bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200/80">
                                {company.gstNumber}
                              </span>
                              <button
                                onClick={() => copyToClipboard(company.gstNumber, "GSTIN")}
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                title="Copy GSTIN"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {gstState && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                                <ShieldCheck className="w-3 h-3" />
                                {gstState}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic font-medium">Unregistered</span>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          {company.email && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <a
                                href={`mailto:${company.email}`}
                                className="hover:underline hover:text-[#FD4B23] truncate max-w-[190px]"
                              >
                                {company.email}
                              </a>
                              <button
                                onClick={() => copyToClipboard(company.email, "Email")}
                                className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                                title="Copy Email"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-1.5 text-gray-600 font-mono">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {!company.email && !company.phone && (
                            <span className="text-gray-400 italic">No contact info</span>
                          )}
                        </div>
                      </td>

                      {/* Registered Address */}
                      <td className="py-4 px-6">
                        {company.address ? (
                          <div className="flex items-start gap-1.5 text-gray-600 max-w-[220px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2 leading-relaxed">{company.address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(company)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${company.status === "inactive"
                              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${company.status === "inactive" ? "bg-red-500" : "bg-emerald-500"
                              }`}
                          ></span>
                          <span>{company.status === "inactive" ? "Inactive" : "Active"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInspectCompany(company)}
                            className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-2 rounded-xl text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"
                            title="Edit Company"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(company)}
                            className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCompanies.map((company) => {
            const gstState = getGSTState(company.gstNumber);
            return (
              <div
                key={company._id}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-lg hover:border-[#FD4B23]/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FD4B23] to-[#FFCE76] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#FD4B23]/20 flex-shrink-0">
                        {company.name ? company.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-gray-900 text-base group-hover:text-[#FD4B23] transition-colors truncate">
                          {company.name}
                        </h3>
                        {gstState && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                            {gstState}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(company)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${company.status === "inactive"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                    >
                      {company.status === "inactive" ? "Inactive" : "Active"}
                    </button>
                  </div>

                  {/* Info Divider Lines */}
                  <div className="space-y-3 text-xs py-3 border-t border-b border-gray-100 my-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">GSTIN</span>
                      <span className="font-mono font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                        {company.gstNumber || "Unregistered"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Phone</span>
                      <span className="font-mono text-gray-700">{company.phone || "—"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Email</span>
                      <span className="text-gray-700 truncate max-w-[180px]">{company.email || "—"}</span>
                    </div>

                    {company.address && (
                      <div className="flex items-start gap-1.5 pt-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2 leading-relaxed">{company.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setInspectCompany(company)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(company)}
                      className="p-2 rounded-xl text-gray-500 hover:text-[#FD4B23] hover:bg-[#FFF0ED] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(company)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-gray-500">
          Showing {paginatedCompanies.length} of {filteredCompanies.length} records (Page {page} of {computedTotalPages})
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-3.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">
            {page} / {computedTotalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, computedTotalPages))}
            disabled={page === computedTotalPages || computedTotalPages === 0}
            className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* SLIDE-OVER INSPECTION DRAWER */}
      {inspectCompany && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectCompany(null)}
          ></div>

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-slide-down">
              {/* Drawer Header */}
              <div className="p-6 bg-gradient-to-r from-[#131313] to-[#1F1F1F] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FD4B23] text-white flex items-center justify-center font-black text-base shadow-md">
                    {inspectCompany.name ? inspectCompany.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base line-clamp-1">{inspectCompany.name}</h3>
                    <span className="text-[10px] text-gray-400">Enterprise Company Inspection</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectCompany(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs custom-scrollbar">
                {/* Account Status Card */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="font-bold text-gray-700">Account Health</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${inspectCompany.status === "inactive"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                  >
                    {inspectCompany.status === "inactive" ? "Inactive" : "Active Operating"}
                  </span>
                </div>

                {/* Tax Profile */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] text-[#FD4B23] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Tax Registration
                  </h4>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">GSTIN</span>
                      {inspectCompany.gstNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            {inspectCompany.gstNumber}
                          </span>
                          <button
                            onClick={() => copyToClipboard(inspectCompany.gstNumber, "GSTIN")}
                            className="p-1 text-gray-400 hover:text-gray-700"
                            title="Copy"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not Provided</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">State / Region</span>
                      <span className="font-semibold text-gray-800">
                        {getGSTState(inspectCompany.gstNumber) || "India"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px] text-[#FD4B23] flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    Contact Information
                  </h4>

                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Email</span>
                      {inspectCompany.email ? (
                        <a
                          href={`mailto:${inspectCompany.email}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {inspectCompany.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Phone</span>
                      <span className="font-mono font-semibold text-gray-900">
                        {inspectCompany.phone || "—"}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-500 font-medium block mb-1">Address</span>
                      <p className="text-gray-800 font-medium leading-relaxed">
                        {inspectCompany.address || "No address specified."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Information */}
                <div className="space-y-2 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Created Date:</span>
                    <span>{new Date(inspectCompany.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{new Date(inspectCompany.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const comp = inspectCompany;
                    setInspectCompany(null);
                    handleEdit(comp);
                  }}
                  className="btn-accent text-xs flex-1 py-2.5"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    const comp = inspectCompany;
                    setInspectCompany(null);
                    setDeleteTarget(comp);
                  }}
                  className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Delete Company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start sm:items-center justify-center z-50 p-3 sm:p-6 pt-6 sm:pt-8 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-scale-in my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 bg-white flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{isEditing ? "Edit Company Profile" : "Add Enterprise Company"}</h3>
                <p className="text-xs text-slate-500 mt-1">Configure tax profiles and corporate contact information</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-7 space-y-6 text-xs overflow-y-auto flex-1 custom-scrollbar">

                {/* Section 1: Company Profile Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FD4B23]"></span>
                    <span>Corporate Identity</span>
                  </div>
                  <div>
                    <label className="form-label">
                      <span>Company Name</span>
                      <span className="form-label-req">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field font-medium text-sm"
                      placeholder="e.g. Lalit Solar Energy Pvt Ltd"
                    />
                  </div>
                </div>

                {/* Section 2: Contact & Tax Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <span>Contact & Tax Profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field font-medium"
                        placeholder="contact@solar.com"
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field font-mono"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">GSTIN Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="input-field font-mono uppercase tracking-wider"
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                    />
                    {formData.gstNumber && getGSTState(formData.gstNumber) && (
                      <p className="text-[11px] font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>State Identified: {getGSTState(formData.gstNumber)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 3: Address & Status Card */}
                <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-5">
                  <div>
                    <label className="form-label">Corporate Address</label>
                    <textarea
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Registered Office & Street Address"
                    ></textarea>
                  </div>

                  <div>
                    <label className="form-label">Operational Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="input-field font-medium cursor-pointer"
                    >
                      <option value="active">Active Company</option>
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
                  {submitting ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div><span>Saving...</span></> : isEditing ? "Save Changes" : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-200/60 p-6 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 mx-auto mb-4 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Delete Company?</h3>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary text-xs flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyMaster;
