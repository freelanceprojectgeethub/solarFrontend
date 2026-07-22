import { useState, useEffect } from "react";
import api from "../../utils/api";

const ReceiptRegister = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/receipt", {
        params: { startDate: startDate || undefined, endDate: endDate || undefined },
      });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch Receipt Register:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toISOString().split("T")[0];
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Receipt Register</h2>

      {/* Filter Card */}
      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Voucher No</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Date</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Customer Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Amount</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Mode</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Reference No</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  Loading report...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{item.voucherNumber}</td>
                  <td className="py-3 px-4 text-gray-600">{formatDate(item.date)}</td>
                  <td className="py-3 px-4 text-gray-600">{item.customerId?.name || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{(item.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{item.mode || "N/A"}</td>
                  <td className="py-3 px-4 text-gray-600">{item.referenceNo || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceiptRegister;
