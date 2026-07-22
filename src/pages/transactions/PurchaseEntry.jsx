import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Calendar, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Calculator, 
  ArrowLeft,
  DollarSign,
  Package,
  Layers,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const PurchaseEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
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
        console.error("Failed to fetch master data for purchase entry:", err);
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

      // Auto-fill unitId, rate (purchasePrice), and gstRate when item is selected
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

  // Calculations
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a vendor / supplier.");
      return;
    }

    const validItems = lineItems.filter(
      (i) => i.itemId && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      alert("Please add at least one line item with valid quantity.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        purchaseNumber: `PO-${Date.now()}`,
        supplierId: formData.supplierId,
        date: formData.date,
        dueDate: formData.dueDate || undefined,
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

      await api.post("/purchases", payload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);

      // Reset Form
      setFormData({
        supplierId: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
        notes: "",
        status: "pending",
      });
      setLineItems([
        { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
      ]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save purchase entry");
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplierObj = suppliers.find((s) => s._id === formData.supplierId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">Purchase Voucher created successfully!</span>
        </div>
      )}

      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Transactions</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Purchase Entry</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FD4B23]/10 text-[#FD4B23] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            Create Purchase Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports/purchase-register"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Purchase Register</span>
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Header Voucher Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD4B23]"></span>
              <span>1. Vendor & Voucher Metadata</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-normal">PO-AUTO-GEN</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Supplier / Vendor Picker */}
            <div className="lg:col-span-2">
              <label className="form-label">
                <span>Vendor / Supplier</span>
                <span className="form-label-req">*</span>
              </label>
              <select
                name="supplierId"
                required
                value={formData.supplierId}
                onChange={handleFormChange}
                className="input-field font-medium text-sm cursor-pointer"
              >
                <option value="">Choose Supplier...</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.phone ? `(${s.phone})` : ""}
                  </option>
                ))}
              </select>
              {selectedSupplierObj && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{selectedSupplierObj.name}</span>
                  <span className="font-mono text-slate-500">{selectedSupplierObj.gstNumber || "No GSTIN"}</span>
                </div>
              )}
            </div>

            {/* Voucher Date */}
            <div>
              <label className="form-label">
                <span>Posting Date</span>
                <span className="form-label-req">*</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
                className="input-field font-mono"
              />
            </div>

            {/* Payment Due Date */}
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
                className="input-field font-mono"
              />
            </div>

            {/* Status Selector */}
            <div>
              <label className="form-label">Entry Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="input-field font-medium cursor-pointer"
              >
                <option value="pending">Pending Approval</option>
                <option value="received">Received / Stock Added</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Items Workspace Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>2. Line Items Workspace</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {lineItems.length} {lineItems.length === 1 ? "Row" : "Rows"}
            </span>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 min-w-[220px]">Item Description</th>
                  <th className="py-3.5 px-3 w-[100px]">Qty</th>
                  <th className="py-3.5 px-3 w-[130px]">Purchase Rate (₹)</th>
                  <th className="py-3.5 px-3 w-[130px]">Unit</th>
                  <th className="py-3.5 px-3 w-[100px]">GST %</th>
                  <th className="py-3.5 px-4 w-[140px] text-right">Amount (Inc. GST)</th>
                  <th className="py-3.5 px-2 w-[60px] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lineItems.map((item, index) => {
                  const itemTotal = calculateItemTotal(item);
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      {/* Item Select */}
                      <td className="p-3">
                        <select
                          value={item.itemId}
                          onChange={(e) =>
                            handleLineItemChange(index, "itemId", e.target.value)
                          }
                          className="input-field font-medium cursor-pointer py-2 text-xs"
                        >
                          <option value="">Select Catalog Item...</option>
                          {items.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name} {i.sku ? `[${i.sku}]` : ""}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Qty */}
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(index, "quantity", e.target.value)
                          }
                          className="input-field font-mono font-semibold py-2 text-xs"
                        />
                      </td>

                      {/* Rate */}
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(index, "rate", e.target.value)
                          }
                          className="input-field font-mono py-2 text-xs"
                        />
                      </td>

                      {/* Unit Select */}
                      <td className="p-3">
                        <select
                          value={item.unitId}
                          onChange={(e) =>
                            handleLineItemChange(index, "unitId", e.target.value)
                          }
                          className="input-field font-medium cursor-pointer py-2 text-xs"
                        >
                          <option value="">Unit...</option>
                          {units.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* GST Rate */}
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="18"
                          value={item.gstRate}
                          onChange={(e) =>
                            handleLineItemChange(index, "gstRate", e.target.value)
                          }
                          className="input-field font-mono py-2 text-xs"
                        />
                      </td>

                      {/* Item Total Amount */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(itemTotal)}
                      </td>

                      {/* Delete Action */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          disabled={lineItems.length <= 1}
                          onClick={() => removeLineItem(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={addLineItem}
              className="px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-800 bg-slate-50/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#FD4B23]" />
              <span>Add Another Item Row</span>
            </button>
          </div>
        </div>

        {/* Section 3: Summary & Notes Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>3. Voucher Notes & Remarks</span>
            </div>
            <textarea
              name="notes"
              rows="5"
              value={formData.notes}
              onChange={handleFormChange}
              className="input-field text-xs"
              placeholder="Add payment terms, transport details, or internal reference notes..."
            ></textarea>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>4. Financial Tax Summary</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (Base Value):</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>CGST:</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(cgst)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>SGST:</span>
                <span className="font-mono font-semibold text-slate-800">{formatCurrency(sgst)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-dashed border-slate-200">
                <span>Total Tax Amount:</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(totalGst)}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between mt-4 shadow-lg shadow-slate-900/10">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Grand Total</span>
                  <span className="text-xs text-slate-400">Net Payable Amount</span>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent py-3.5 text-xs font-bold shadow-lg shadow-[#FD4B23]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Saving Voucher...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Issue Purchase Voucher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseEntry;
