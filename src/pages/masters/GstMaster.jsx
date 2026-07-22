import { useState, useEffect } from "react";
import api from "../../utils/api";

const GstMaster = () => {
  const [gstList, setGstList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    taxName: "",
    rate: "",
    type: "CGST",
  });

  const fetchGst = async () => {
    setLoading(true);
    try {
      const res = await api.get("/gst", {
        params: { page, limit: 10, search },
      });
      setGstList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch GST records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGst();
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
      taxName: "",
      rate: "",
      type: "CGST",
    });
    setShowModal(true);
  };

  const handleEdit = (gst) => {
    setIsEditing(true);
    setEditingId(gst._id);
    setFormData({
      taxName: gst.taxName || "",
      rate: gst.rate ?? "",
      type: gst.type || "CGST",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this GST rate?")) {
      try {
        await api.delete(`/gst/${id}`);
        fetchGst();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete GST rate");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        rate: Number(formData.rate),
      };
      if (isEditing) {
        await api.put(`/gst/${editingId}`, payload);
      } else {
        await api.post("/gst", payload);
      }
      handleCloseModal();
      fetchGst();
    } catch (error) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      taxName: "",
      rate: "",
      type: "CGST",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">GST Master</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search GST..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Add GST
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Tax Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Rate (%)</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Type</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  Loading GST records...
                </td>
              </tr>
            ) : gstList.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No GST records found.
                </td>
              </tr>
            ) : (
              gstList.map((gst) => (
                <tr key={gst._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{gst.taxName}</td>
                  <td className="py-3 px-4 text-gray-600">{gst.rate}%</td>
                  <td className="py-3 px-4 text-gray-600">{gst.type}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        gst.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {gst.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-3">
                    <button
                      onClick={() => handleEdit(gst)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(gst._id)}
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
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? "Edit GST Rate" : "Add GST Rate"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Name
                </label>
                <input
                  type="text"
                  name="taxName"
                  required
                  value={formData.taxName}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tax Name (e.g. GST 18%)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (%)
                </label>
                <input
                  type="number"
                  name="rate"
                  step="0.01"
                  required
                  value={formData.rate}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rate (e.g. 18)"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CGST">CGST</option>
                  <option value="SGST">SGST</option>
                  <option value="IGST">IGST</option>
                  <option value="CESS">CESS</option>
                </select>
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

export default GstMaster;
