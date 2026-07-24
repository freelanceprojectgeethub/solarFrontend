import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Lock,
  KeyRound,
  RefreshCw,
  XCircle,
  AlertTriangle,
} from "lucide-react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRoles = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/roles", {
        params: { page: 1, limit: 200, search },
      });
      const data = res.data.data || [];
      setRoles(data);
      setTotalCount(res.data.total || data.length);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      showToast("Failed to load roles", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [search]);

  // Filtered
  const filteredRoles = useMemo(() => {
    let result = [...roles];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [roles, search]);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredRoles.slice(start, start + limit);
  }, [filteredRoles, page, limit]);

  const computedTotalPages = Math.ceil(filteredRoles.length / limit) || 1;

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteTarget._id}`);
      showToast("Role deleted successfully");
      setDeleteTarget(null);
      fetchRoles();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete role", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Role name is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/roles/${editingId}`, formData);
        showToast("Role permissions updated!");
      } else {
        await api.post("/roles", formData);
        showToast("New role created successfully!");
      }
      handleCloseModal();
      fetchRoles();
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
      description: "",
      permissions: [],
    });
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
            Roles & Permissions
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Configure Role-Based Access Control (RBAC) matrix for module permissions across the application.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fetchRoles(true)}
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
            <span>Define New Role</span>
          </button>
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
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search roles..."
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

        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          {roles.length} total roles defined
        </span>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: "rgba(99,102,241,0.08)", color: "#4f46e5", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} className="animate-spin" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Loading Roles...</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Retrieving security policies</p>
        </div>
      ) : paginatedRoles.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 60, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#f3f4f6", color: "#9ca3af", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>No Roles Found</h3>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 360, margin: "6px auto 20px auto", lineHeight: 1.5 }}>
            {search ? "No roles matched your search query." : "No access roles defined yet. Click below to create your first role."}
          </p>
          {search ? (
            <button onClick={() => setSearch("")} style={{ height: 38, padding: "0 16px", borderRadius: 10, backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Clear Search</button>
          ) : (
            <button onClick={handleOpenAddModal} style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)", color: "#ffffff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Plus size={16} />
              <span>Define New Role</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "14px 20px" }}>Role Name</th>
                  <th style={{ padding: "14px 20px" }}>Description</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Permitted Modules</th>
                  <th style={{ padding: "14px 20px", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13, color: "#374151" }}>
                {paginatedRoles.map((role) => (
                  <tr
                    key={role._id}
                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(99,102,241,0.08)", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <KeyRound size={16} />
                        </div>
                        <span style={{ fontWeight: 700, color: "#111827" }}>{role.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#6b7280" }}>
                      {role.description || <span style={{ fontStyle: "italic", color: "#9ca3af" }}>No description</span>}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12, backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                        {(role.permissions || []).length} Modules Allowed
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, backgroundColor: role.status === "inactive" ? "#fef2f2" : "#f0fdf4", color: role.status === "inactive" ? "#dc2626" : "#16a34a", border: role.status === "inactive" ? "1px solid #fecaca" : "1px solid #bbf7d0" }}>
                        {role.status || "active"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => handleEdit(role)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(253,75,35,0.08)"; e.currentTarget.style.color = "#FD4B23"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Edit Permissions"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
                          title="Delete Role"
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
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: "#6b7280" }}>
          Showing {paginatedRoles.length} of {filteredRoles.length} roles (Page {page} of {computedTotalPages})
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

      {/* PERMISSION MATRIX MODAL */}
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
                maxWidth: 820,
                maxHeight: "90vh",
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
                    {isEditing ? "Edit Role & Access Permissions" : "Create New Access Role"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0 0" }}>
                    Configure granular CRUD matrix across system modules.
                  </p>
                </div>
                <button onClick={handleCloseModal} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", flex: 1, fontSize: 13 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Role Title <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Sales Manager, Accountant"
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
                          fontWeight: 600,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                        Role Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Short summary of role scope..."
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
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(253,75,35,0.4)"; e.target.style.backgroundColor = "#ffffff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Module Permissions Matrix ({MODULES.length} Modules)
                    </span>

                    <div style={{ borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                            <th style={{ padding: "10px 16px" }}>Module Name</th>
                            {ACTIONS.map((act) => (
                              <th key={act.key} style={{ padding: "10px 12px", textAlign: "center", width: 80 }}>
                                {act.label}
                              </th>
                            ))}
                            <th style={{ padding: "10px 12px", textAlign: "center", width: 90 }}>Select All</th>
                          </tr>
                        </thead>
                        <tbody style={{ fontSize: 12, color: "#374151" }}>
                          {MODULES.map((moduleName) => {
                            const perm = (formData.permissions || []).find((p) => p.module === moduleName);
                            const isAllSelected = perm && perm.actions.length === 4;

                            return (
                              <tr key={moduleName} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "10px 16px", fontWeight: 600, color: "#111827" }}>{moduleName}</td>
                                {ACTIONS.map((action) => {
                                  const checked = hasAction(moduleName, action.key);
                                  return (
                                    <td key={action.key} style={{ padding: "10px 12px", textAlign: "center" }}>
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) =>
                                          handlePermissionChange(moduleName, action.key, e.target.checked)
                                        }
                                        style={{ accentColor: "#FD4B23", width: 15, height: 15, cursor: "pointer" }}
                                      />
                                    </td>
                                  );
                                })}
                                <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAllModuleActions(moduleName)}
                                    style={{
                                      padding: "2px 8px",
                                      borderRadius: 6,
                                      border: "none",
                                      fontSize: 10,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      backgroundColor: isAllSelected ? "rgba(253,75,35,0.12)" : "#f3f4f6",
                                      color: isAllSelected ? "#FD4B23" : "#6b7280",
                                    }}
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
                    {submitting ? "Saving..." : isEditing ? "Save Permissions" : "Create Role"}
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>Delete Access Role?</h3>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
                Are you sure you want to delete <span style={{ fontWeight: 700, color: "#111827" }}>"{deleteTarget.name}"</span>? Users assigned to this role will lose their permissions.
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

export default RoleMaster;
