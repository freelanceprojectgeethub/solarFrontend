import { useState, useEffect } from "react";
import api from "../../utils/api";

const FuturePurchaseEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDate: "",
    notes: "",
    status: "pending",
  });

  const [lineItems, setLineItems] = useState([
    { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
  ]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [supRes, itemRes, unitRes] = await Promise.all([
          api.get("/suppliers?limit=100"),
          api.get("/items?limit=100"),
          api.get("/units?limit=100"),
        ]);
        setSuppliers(supRes.data.data || []);
        setItems(itemRes.data.data || []);
        setUnits(unitRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch master data for future purchase entry:", err);
      }
    };
    fetchMasterData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const itemRow = { ...updated[index], [field]: value };

      if (field === "itemId" && value) {
        const selectedObj = items.find((i) => i._id === value);
        if (selectedObj) {
          if (selectedObj.unitId) {
            itemRow.unitId = selectedObj.unitId._id || selectedObj.unitId;
          }
          if (selectedObj.purchasePrice != null) {
            itemRow.rate = selectedObj.purchasePrice;
          }
          if (selectedObj.gstRate != null) {
            itemRow.gstRate = selectedObj.gstRate;
          }
        }
      }

      updated[index] = itemRow;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const calculateItemTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gst = Number(item.gstRate) || 0;
    const base = qty * rate;
    const gstAmt = (base * gst) / 100;
    return base + gstAmt;
  };

  const subtotal = lineItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    return acc + qty * rate;
  }, 0);

  const totalGst = lineItems.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gst = Number(item.gstRate) || 0;
    return acc + (qty * rate * gst) / 100;
  }, 0);

  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const grandTotal = subtotal + totalGst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a supplier.");
      return;
    }

    const validItems = lineItems.filter(
      (i) => i.itemId && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one valid line item with quantity > 0.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fpNumber: `FP-${Date.now()}`,
        supplierId: formData.supplierId,
        orderDate: formData.orderDate,
        expectedDate: formData.expectedDate || undefined,
        notes: formData.notes,
        status: formData.status,
        items: validItems.map((item) => ({
          itemId: item.itemId,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          unitId: item.unitId || undefined,
          gstRate: Number(item.gstRate || 0),
        })),
      };

      await api.post("/future-purchases", payload);
      alert("Future Purchase saved successfully!");

      setFormData({
        supplierId: "",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDate: "",
        notes: "",
        status: "pending",
      });
      setLineItems([
        { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
      ]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save future purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Future Purchase Entry
      </h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              name="supplierId"
              required
              value={formData.supplierId}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date *
            </label>
            <input
              type="date"
              name="orderDate"
              required
              value={formData.orderDate}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Date
            </label>
            <input
              type="date"
              name="expectedDate"
              value={formData.expectedDate}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Items</h3>

          {/* Grid Table Header */}
          <div className="grid grid-cols-12 gap-2 font-bold bg-gray-100 p-3 rounded text-sm text-gray-700 mb-2">
            <div className="col-span-3">Item</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Rate (₹)</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-1">GST %</div>
            <div className="col-span-2">Total (₹)</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Grid Table Rows */}
          {lineItems.map((item, index) => {
            const itemTotal = calculateItemTotal(item);
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 items-center mb-2"
              >
                {/* Item Select */}
                <div className="col-span-3">
                  <select
                    value={item.itemId}
                    onChange={(e) =>
                      handleLineItemChange(index, "itemId", e.target.value)
                    }
                    className="border rounded px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Item</option>
                    {items.map((i) => (
                      <option key={i._id} value={i._id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div className="col-span-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(index, "quantity", e.target.value)
                    }
                    className="border rounded px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Rate */}
                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      handleLineItemChange(index, "rate", e.target.value)
                    }
                    className="border rounded px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Unit Select */}
                <div className="col-span-2">
                  <select
                    value={item.unitId}
                    onChange={(e) =>
                      handleLineItemChange(index, "unitId", e.target.value)
                    }
                    className="border rounded px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* GST Rate */}
                <div className="col-span-1">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="GST %"
                    value={item.gstRate}
                    onChange={(e) =>
                      handleLineItemChange(index, "gstRate", e.target.value)
                    }
                    className="border rounded px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total */}
                <div className="col-span-2 text-right font-semibold text-sm text-gray-800 pr-2">
                  ₹{itemTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                {/* Action */}
                <div className="col-span-1 text-center">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addLineItem}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Item
          </button>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / Remarks
            </label>
            <textarea
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Additional terms or notes..."
            ></textarea>
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">
                  ₹{subtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST:</span>
                <span className="font-semibold text-gray-800">
                  ₹{cgst.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST:</span>
                <span className="font-semibold text-gray-800">
                  ₹{sgst.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Grand Total:</span>
                <span className="text-blue-600">
                  ₹{grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Future Purchase"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FuturePurchaseEntry;
