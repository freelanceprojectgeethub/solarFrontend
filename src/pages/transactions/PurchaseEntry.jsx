import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
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
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

const PurchaseEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
        showToast("Failed to load vendors or items", "error");
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

  // Calculations
  const calculateItemTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gst = Number(item.gstRate) || 0;
    const base = qty * rate;
    const gstAmt = (base * gst) / 100;
    return base + gstAmt;
  };

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      return acc + qty * rate;
    }, 0);
  }, [lineItems]);

  const totalGst = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const gst = Number(item.gstRate) || 0;
      return acc + (qty * rate * gst) / 100;
    }, 0);
  }, [lineItems]);

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
      showToast("Please select a vendor / supplier", "error");
      return;
    }

    const validItems = lineItems.filter(
      (i) => i.itemId && Number(i.quantity) > 0
    );

    if (validItems.length === 0) {
      showToast("Please add at least one line item with valid quantity", "error");
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
      showToast("Purchase Voucher created successfully!");

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
      showToast(error.response?.data?.message || "Failed to save purchase entry", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedSupplierObj = suppliers.find((s) => s._id === formData.supplierId);

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
            Create Purchase Voucher
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4, margin: 0 }}>
            Record procurement bills, component purchases, and vendor invoices into inventory.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            to="/reports/purchase"
            style={{
              height: 38,
              padding: "0 16px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
          >
            <FileText size={14} color="#6b7280" />
            <span>Purchase Register</span>
          </Link>
        </div>
      </div>

      {/* KPI Live Calculations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Subtotal</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{formatCurrency(subtotal)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Base items cost</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Total GST Tax</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#d97706" }}>{formatCurrency(totalGst)}</div>
          <div style={{ fontSize: 11, color: "#d97706", marginTop: 2 }}>CGST: {formatCurrency(cgst)} | SGST: {formatCurrency(sgst)}</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Line Items</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>{lineItems.length} Products</div>
          <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>In purchase order</div>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: "16px 20px", border: "1px solid #e5e7eb", background: "linear-gradient(135deg, #111113 0%, #1f1f23 100%)", color: "#ffffff" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Grand Total Bill</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FD4B23" }}>{formatCurrency(grandTotal)}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Inclusive of all taxes</div>
        </div>
      </div>

      {/* Main Entry Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Section 1: Vendor & Voucher Metadata */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FD4B23" }} />
              <span>1. Vendor & Voucher Metadata</span>
            </div>
            <span style={{ fontFamily: "monospace", color: "#9ca3af", fontWeight: 500 }}>Auto PO Voucher</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {/* Vendor Selector */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Vendor / Supplier <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="supplierId"
                required
                value={formData.supplierId}
                onChange={handleFormChange}
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
                  cursor: "pointer",
                }}
              >
                <option value="">Select Vendor Company...</option>
                {suppliers.map((sup) => (
                  <option key={sup._id} value={sup._id}>
                    {sup.name} {sup.gstNumber ? `(GST: ${sup.gstNumber})` : ""}
                  </option>
                ))}
              </select>
              {selectedSupplierObj && (
                <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500, marginTop: 4 }}>
                  Contact: {selectedSupplierObj.phone || selectedSupplierObj.email || "No direct phone"} | Address: {selectedSupplierObj.address || "N/A"}
                </div>
              )}
            </div>

            {/* Voucher Date */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Invoice Date <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleFormChange}
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
              />
            </div>

            {/* Payment Status */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Bill Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
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
                  cursor: "pointer",
                }}
              >
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FD4B23" }} />
              <span>2. Purchased Line Items</span>
            </div>
            <button
              type="button"
              onClick={addLineItem}
              style={{
                height: 32,
                padding: "0 14px",
                borderRadius: 8,
                border: "none",
                backgroundColor: "rgba(253,75,35,0.1)",
                color: "#FD4B23",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              <span>Add Item Row</span>
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                  <th style={{ padding: "10px 14px", width: "35%" }}>Solar Component Item</th>
                  <th style={{ padding: "10px 14px", width: "15%" }}>Qty</th>
                  <th style={{ padding: "10px 14px", width: "15%" }}>Rate (₹)</th>
                  <th style={{ padding: "10px 14px", width: "15%" }}>GST %</th>
                  <th style={{ padding: "10px 14px", width: "15%", textAlign: "right" }}>Total (₹)</th>
                  <th style={{ padding: "10px 14px", width: "5%", textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody style={{ fontSize: 13 }}>
                {lineItems.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {/* Item selector */}
                    <td style={{ padding: "10px 14px" }}>
                      <select
                        value={row.itemId}
                        onChange={(e) => handleLineItemChange(idx, "itemId", e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          outline: "none",
                          color: "#111827",
                        }}
                      >
                        <option value="">Select Item / Panel / Inverter...</option>
                        {items.map((it) => (
                          <option key={it._id} value={it._id}>
                            {it.name} (SKU: {it.sku || "N/A"})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: "10px 14px" }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          outline: "none",
                          color: "#111827",
                          fontWeight: 600,
                        }}
                      />
                    </td>

                    {/* Rate */}
                    <td style={{ padding: "10px 14px" }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Rate ₹"
                        value={row.rate}
                        onChange={(e) => handleLineItemChange(idx, "rate", e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          outline: "none",
                          color: "#111827",
                          fontWeight: 600,
                        }}
                      />
                    </td>

                    {/* GST % */}
                    <td style={{ padding: "10px 14px" }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="GST %"
                        value={row.gstRate}
                        onChange={(e) => handleLineItemChange(idx, "gstRate", e.target.value)}
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          fontSize: 13,
                          fontFamily: "'Inter', system-ui, sans-serif",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          outline: "none",
                          color: "#111827",
                          fontWeight: 600,
                        }}
                      />
                    </td>

                    {/* Line Total */}
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#111827" }}>
                      {formatCurrency(calculateItemTotal(row))}
                    </td>

                    {/* Delete row */}
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: "none",
                          backgroundColor: lineItems.length === 1 ? "transparent" : "#fef2f2",
                          color: lineItems.length === 1 ? "#d1d5db" : "#ef4444",
                          cursor: lineItems.length === 1 ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Notes & Action */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
              Voucher Notes & Terms
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="Delivery terms, transport details, warranty notes..."
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: "'Inter', system-ui, sans-serif",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                outline: "none",
                color: "#111827",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                height: 44,
                padding: "0 28px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #FD4B23 0%, #e5401e 100%)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "0 4px 14px rgba(253,75,35,0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{loading ? "Processing..." : "Save Purchase Voucher"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseEntry;
