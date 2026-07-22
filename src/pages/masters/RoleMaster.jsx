import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  CheckSquare,
  Square,
  KeyRound
} from "lucide-react";
import api from "../../utils/api";

const MODULES = [
  "Companies",
  "Brands",
  "Units",
  "Suppliers",
  "Customers",
  "Banks",
  "GST",
  "Categories",
  "Items",
  "Roles",
  "Users",
  "Purchases",
  "Future Purchases",
  "Sales",
  "Future Sales",
  "Payments",
  "Receipts",
];

const ACTIONS = [
  { key: "create", label: "Create" },
  { key: "read", label: "Read" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

const RoleMaster = () => {
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
    description: "",
    permissions: [],
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/roles", {
        params: { page, limit: 10, search },
      });
      setRoles(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const hasAction = (moduleName, actionKey) => {
    const perm = (formData.permissions || []).find((p) => p.module === moduleName);
    return perm ? perm.actions.includes(actionKey) : false;
  };

  const handlePermissionChange = (moduleName, actionKey, isChecked) => {
    setFormData((prev) => {
      const existingPerms = prev.permissions || [];
      const permIndex = existingPerms.findIndex((p) => p.module === moduleName);

      let updatedPerms = [...existingPerms];

      if (permIndex > -1) {
        const currentActions = updatedPerms[permIndex].actions || [];
        let newActions;
        if (isChecked) {
          newActions = [...new Set([...currentActions, actionKey])];
        } else {
          newActions = currentActions.filter((a) => a !== actionKey);
        }

        if (newActions.length === 0) {
          updatedPerms = updatedPerms.filter((p) => p.module !== moduleName);
        } else {
          updatedPerms[permIndex] = {
            ...updatedPerms[permIndex],
            actions: newActions,
          };
        }
      } else {
        if (isChecked) {
          updatedPerms.push({
            module: moduleName,
            actions: [actionKey],
          });
        }
      }

      return { ...prev, permissions: updatedPerms };
    });
  };

  const handleSelectAllModuleActions = (moduleName) => {
    const perm = (formData.permissions || []).find((p) => p.module === moduleName);
    const allSelected = perm && perm.actions.length === 4;

    setFormData((prev) => {
      let updatedPerms = (prev.permissions || []).filter((p) => p.module !== moduleName);
      if (!allSelected) {
        updatedPerms.push({
          module: moduleName,
          actions: ["create", "read", "update", "delete"],
        });
      }
      return { ...prev, permissions: updatedPerms };
    });
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setIsEditing(true);
    setEditingId(role._id);
    setFormData({
      name: role.name || "",
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this RBAC role?")) {
      try {
        await api.delete(`/roles/${id}`);
        fetchRoles();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete role");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/roles/${editingId}`, formData);
      } else {
        await api.post("/roles", formData);
      }
      handleCloseModal();
      fetchRoles();
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
      description: "",
      permissions: [],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Settings</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Role Management</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            RBAC Roles & Permissions Matrix
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn-accent px-4 py-2.5 text-xs font-bold shadow-md shadow-[#FD4B23]/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Role</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={handleSearchChange}
            className="input-field text-xs pl-10"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Manage system roles and access policies
        </span>
      </div>

      {/* Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-5">Role Name</th>
                <th className="py-4 px-5">Description</th>
                <th className="py-4 px-4 text-center">Permitted Modules</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                      <span>Loading roles & permissions...</span>
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700">No RBAC roles configured</p>
                      <p className="text-xs text-slate-400">Click "Define New Role" to set up access levels.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{role.name}</span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">{role.description || "No description"}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      <span className="inline-flex items-center px-2.5 py-1 text-[11px] rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {(role.permissions || []).length} Modules
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize ${
                        role.status === "inactive"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {role.status || "active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit Role & Permissions"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Role"
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

      {/* Permission Matrix Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditing ? "Edit Role & Access Permissions" : "Create New Access Role"}
                </h3>
                <p className="text-xs text-slate-500">Assign module-level actions for user accounts</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    <span>Role Title</span>
                    <span className="form-label-req">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field font-semibold"
                    placeholder="e.g. Sales Manager, Accountant"
                  />
                </div>

                <div>
                  <label className="form-label">Role Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field text-xs"
                    placeholder="Short description of responsibilities..."
                  />
                </div>
              </div>

              {/* Matrix Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Module Access Matrix ({MODULES.length} System Modules)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 min-w-[180px]">System Module</th>
                        {ACTIONS.map((act) => (
                          <th key={act.key} className="py-3 px-3 text-center w-[90px]">
                            {act.label}
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center w-[90px]">Select All</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {MODULES.map((moduleName) => {
                        const perm = (formData.permissions || []).find((p) => p.module === moduleName);
                        const isAllSelected = perm && perm.actions.length === 4;

                        return (
                          <tr key={moduleName} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{moduleName}</td>
                            {ACTIONS.map((action) => {
                              const checked = hasAction(moduleName, action.key);
                              return (
                                <td key={action.key} className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        moduleName,
                                        action.key,
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer border-slate-300"
                                  />
                                </td>
                              );
                            })}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectAllModuleActions(moduleName)}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded transition-all ${
                                  isAllSelected
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {isAllSelected ? "All On" : "All"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Action Bar */}
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
                  className="btn-accent bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/25"
                >
                  {isEditing ? "Save Permission Matrix" : "Create Role"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMaster;
