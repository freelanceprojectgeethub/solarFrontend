import { useState, useEffect } from "react";
import api from "../../utils/api";

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brandId: "",
    categoryId: "",
    unitId: "",
    hsnCode: "",
    gstRate: "",
    sellingPrice: "",
    purchasePrice: "",
    description: "",
  });

  const fetchDropdowns = async () => {
    try {
      const [brandRes, catRes, unitRes] = await Promise.all([
        api.get("/brands?limit=100"),
        api.get("/categories?limit=100"),
        api.get("/units?limit=100"),
      ]);
      setBrands(brandRes.data.data || []);
      setCategories(catRes.data.data || []);
      setUnits(unitRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/items", {
        params: { page, limit: 10, search },
      });
      setItems(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchItems();
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
      sku: "",
      brandId: "",
      categoryId: "",
      unitId: "",
      hsnCode: "",
      gstRate: "",
      sellingPrice: "",
      purchasePrice: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      sku: item.sku || "",
      brandId: item.brandId?._id || item.brandId || "",
      categoryId: item.categoryId?._id || item.categoryId || "",
      unitId: item.unitId?._id || item.unitId || "",
      hsnCode: item.hsnCode || "",
      gstRate: item.gstRate ?? "",
      sellingPrice: item.sellingPrice ?? "",
      purchasePrice: item.purchasePrice ?? "",
      description: item.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        brandId: formData.brandId || null,
        categoryId: formData.categoryId || null,
        unitId: formData.unitId || null,
        gstRate: formData.gstRate !== "" ? Number(formData.gstRate) : undefined,
        sellingPrice: Number(formData.sellingPrice),
        purchasePrice: Number(formData.purchasePrice),
      };

      if (isEditing) {
        await api.put(`/items/${editingId}`, payload);
      } else {
        await api.post("/items", payload);
      }
      handleCloseModal();
      fetchItems();
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
      sku: "",
      brandId: "",
      categoryId: "",
      unitId: "",
      hsnCode: "",
      gstRate: "",
      sellingPrice: "",
      purchasePrice: "",
      description: "",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Item Master</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">SKU</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Brand</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Category</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Unit</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Sale Price</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Purchase Price</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  Loading items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-gray-500">
                  No items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 px-4 text-gray-600">{item.sku || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{item.brandId?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{item.categoryId?.name || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{item.unitId?.name || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{item.sellingPrice?.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    ₹{item.purchasePrice?.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.status || "active"}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
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
          <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {isEditing ? "Edit Item" : "Add Item"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 540W Solar Panel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SKU Code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unitId"
                    value={formData.unitId}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HSN Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    name="gstRate"
                    step="0.01"
                    value={formData.gstRate}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="sellingPrice"
                    required
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Selling Price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    required
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Purchase Price"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Item Specifications / Notes"
                ></textarea>
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

export default ItemMaster;
