import { useState, useEffect } from "react";
import { 
  UserCog, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Building2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  Lock,
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import api from "../../utils/api";

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    companyId: "",
    roleId: "",
  });

  const fetchDropdowns = async () => {
    try {
      const [compRes, roleRes] = await Promise.all([
        api.get("/companies?limit=100"),
        api.get("/roles?limit=100"),
      ]);
      setCompanies(compRes.data.data || []);
      setRoles(roleRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch companies/roles:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        params: { page, limit: 10, search },
      });
      setUsers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

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
      username: "",
      password: "",
      companyId: "",
      roleId: "",
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setEditingId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      username: user.username || "",
      password: "",
      companyId: user.companyId?._id || user.companyId || "",
      roleId: user.roleId?._id || user.roleId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user account?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        companyId: formData.companyId || null,
        roleId: formData.roleId || null,
      };

      if (!isEditing) {
        payload.password = formData.password;
      } else if (formData.password) {
        payload.password = formData.password;
      }

      if (isEditing) {
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", payload);
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
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
      username: "",
      password: "",
      companyId: "",
      roleId: "",
    });
  };

  // Helper for initial avatars
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Settings</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">User Management</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <UserCog className="w-4 h-4" />
            </div>
            Team Users & Access Provisioning
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-accent px-4 py-2.5 text-xs font-bold shadow-md shadow-[#FD4B23]/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={handleSearchChange}
            className="input-field text-xs pl-10"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Assign team members to corporate roles and branches
        </span>
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Contact Details</th>
                <th className="py-4 px-4">Assigned Company</th>
                <th className="py-4 px-4">Assigned Role</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <UserCog className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No user accounts found</p>
                      <p className="text-xs text-slate-400">Click "Provision User Account" to add team members.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {getInitials(usr.name)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{usr.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{usr.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">@{usr.username}</td>
                    <td className="py-3.5 px-4 text-slate-600">{usr.phone || "N/A"}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{usr.companyId?.name || "Global / Master"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        <span>{usr.roleId?.name || "Unassigned"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                        usr.status === "inactive"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {usr.status || "active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(usr)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit User Account"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usr._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Provisioning Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? "Edit User Account" : "Provision New User"}
                </h3>
                <p className="text-xs text-slate-500">Configure team member profile and permissions</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    <span>Full Name</span>
                    <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field font-semibold"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Email Address</span>
                    <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field font-mono text-xs"
                    placeholder="rahul@company.com"
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="form-label">
                    <span>Username</span>
                    <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-field font-mono text-xs"
                    placeholder="rahul_sharma"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">
                    <span>Account Password</span>
                    {!isEditing && <span className="form-label-req">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field font-mono text-xs"
                    placeholder={isEditing ? "Leave blank to keep current password" : "Secure password..."}
                  />
                  {isEditing && (
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Leave blank if password reset is not required.
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label">Company Branch</label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className="input-field font-medium cursor-pointer"
                  >
                    <option value="">Select Company Branch...</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Role Access Level</label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="input-field font-medium cursor-pointer"
                  >
                    <option value="">Select Role...</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-accent bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold shadow-md shadow-blue-600/25"
                >
                  {isEditing ? "Save Changes" : "Provision User"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserMaster;
