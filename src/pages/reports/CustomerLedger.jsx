import { useState, useEffect } from "react";
import api from "../../utils/api";

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [data, setData] = useState([]);
  const [closingBalance, setClosingBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers?limit=1000");
        setCustomers(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  const fetchLedger = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/reports/customer-ledger", {
        params: { customerId: selectedCustomer },
      });
      setData(res.data.data || []);
      setClosingBalance(res.data.closingBalance ?? 0);
    } catch (err) {
      console.error("Failed to fetch Customer Ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowLedger = (e) => {
    e.preventDefault();
    fetchLedger();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Ledger</h2>

      {/* Filter Card */}
      <form
        onSubmit={handleShowLedger}
        className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4"
      >
        <div className="w-72">
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">
            Select Customer *
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose Customer</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Show Ledger
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Date</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Type</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Reference</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Credit (₹)</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Debit (₹)</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  Loading ledger...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No ledger entries found. Select a customer and click "Show Ledger".
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">{formatDate(item.date)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        item.type === "sale"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{item.reference || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    {item.credit > 0 ? `₹${item.credit.toLocaleString("en-IN")}` : "-"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-red-600">
                    {item.debit > 0 ? `₹${item.debit.toLocaleString("en-IN")}` : "-"}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">
                    ₹{(item.balance || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Box */}
      {closingBalance !== null && (
        <div className="mt-4 bg-white rounded-lg shadow p-4 flex justify-end">
          <div className="text-lg font-bold text-gray-800">
            Closing Balance:{" "}
            <span
              className={closingBalance >= 0 ? "text-green-600" : "text-red-600"}
            >
              ₹{closingBalance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
