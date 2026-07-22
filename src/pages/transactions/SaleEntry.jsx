import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  Calculator, 
  ArrowLeft,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Receipt
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const SaleEntry = () => {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    status: "unpaid",
  });

  const [lineItems, setLineItems] = useState([
    { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
  ]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [custRes, itemRes, unitRes] = await Promise.all([
          api.get("/customers?limit=100"),
          api.get("/items?limit=100"),
          api.get("/units?limit=100"),
        ]);
        setCustomers(custRes.data.data || []);
        setItems(itemRes.data.data || []);
        setUnits(unitRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch master data for sale entry:", err);
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
          if (selectedObj.sellingPrice != null) {
            itemRow.rate = selectedObj.sellingPrice;
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert("Please select a customer.");
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
        saleNumber: `SALE-${Date.now()}`,
        customerId: formData.customerId,
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

      await api.post("/sales", payload);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);

      setFormData({
        customerId: "",
        date: new Date().toISOString().split("T")[0],
        dueDate: "",
        notes: "",
        status: "unpaid",
      });
      setLineItems([
        { itemId: "", quantity: "", rate: "", unitId: "", gstRate: "" },
      ]);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save sale invoice");
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => c._id === formData.customerId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">Tax Invoice generated & saved successfully!</span>
        </div>
      )}

      {/* Page Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Transactions</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Sales Invoice</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            Create Sales Tax Invoice
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports/sales-register"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>Sales Register</span>
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Customer & Invoice Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>1. Customer & Billing Profile</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-normal">SALE-AUTO-GEN</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Selector */}
            <div className="lg:col-span-2">
              <label className="form-label">
                <span>Customer / B2B Client</span>
                <span className="form-label-req">*</span>
              </label>
              <select
                name="customerId"
                required
                value={formData.customerId}
                onChange={handleFormChange}
                className="input-field font-medium text-sm cursor-pointer"
              >
                <option value="">Choose Customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
              {selectedCustomerObj && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{selectedCustomerObj.name}</span>
                  <span className="font-mono text-slate-500">{selectedCustomerObj.gstNumber || "Consumer (B2C)"}</span>
                </div>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <label className="form-label">
                <span>Invoice Date</span>
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

            {/* Due Date */}
            <div>
              <label className="form-label">Payment Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleFormChange}
                className="input-field font-mono"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="form-label">Billing Payment Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="input-field font-medium cursor-pointer"
              >
                <option value="unpaid">Unpaid / Credit</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid Full</option>
                <option value="cancelled">Cancelled Invoice</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Items Workspace */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>2. Product & Billing Line Items</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {lineItems.length} {lineItems.length === 1 ? "Row" : "Rows"}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 min-w-[220px]">Item Description</th>
                  <th className="py-3.5 px-3 w-[100px]">Qty</th>
                  <th className="py-3.5 px-3 w-[130px]">Selling Rate (₹)</th>
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
                      <td className="p-3">
                        <select
                          value={item.itemId}
                          onChange={(e) =>
                            handleLineItemChange(index, "itemId", e.target.value)
                          }
                          className="input-field font-medium cursor-pointer py-2 text-xs"
                        >
                          <option value="">Select Product Item...</option>
                          {items.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name} {i.sku ? `[${i.sku}]` : ""}
                            </option>
                          ))}
                        </select>
                      </td>

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

                      <td className="p-3 text-right font-mono font-bold text-slate-900 text-xs">
                        {formatCurrency(itemTotal)}
                      </td>

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
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Product Line Row</span>
            </button>
          </div>
        </div>

        {/* Section 3: Summary & Notes Split Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>3. Customer Notes & Terms</span>
            </div>
            <textarea
              name="notes"
              rows="5"
              value={formData.notes}
              onChange={handleFormChange}
              className="input-field text-xs"
              placeholder="Payment terms, bank details for transfer, warranty terms..."
            ></textarea>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>4. Invoice Value Calculation</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal (Base Sales):</span>
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
                  <span className="text-xs text-slate-400">Total Invoice Billed</span>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-accent bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Generating Invoice...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Generate & Post Sales Invoice</span>
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

export default SaleEntry;
