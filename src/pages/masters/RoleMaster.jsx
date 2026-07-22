import { useState, useEffect } from "react";
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
    if (window.confirm("Are you sure you want to delete this role?")) {
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
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Role Master</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Add Role
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Description</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  Loading roles...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{role.name}</td>
                  <td className="py-3 px-4 text-gray-600">{role.description || "N/A"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        role.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {role.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-3">
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(role._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="space-x-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? "Edit Role" : "Add Role"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Role Name (e.g. Admin, Manager)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Role Description"
                ></textarea>
              </div>

              {/* Permissions Section */}
              <div className="mt-6 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                  Permissions
                </h4>

                {/* Table Header for Grid */}
                <div className="grid grid-cols-5 gap-2 font-semibold text-xs text-gray-600 uppercase tracking-wider pb-2 border-b mb-2">
                  <div>Module</div>
                  <div className="text-center">Create</div>
                  <div className="text-center">Read</div>
                  <div className="text-center">Update</div>
                  <div className="text-center">Delete</div>
                </div>

                {MODULES.map((moduleName) => (
                  <div
                    key={moduleName}
                    className="grid grid-cols-5 gap-2 items-center border-b pb-2 mb-2 hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <span className="font-medium text-sm text-gray-700">
                      {moduleName}
                    </span>
                    {ACTIONS.map((action) => {
                      const checked = hasAction(moduleName, action.key);
                      return (
                        <div key={action.key} className="flex justify-center">
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
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Save
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
