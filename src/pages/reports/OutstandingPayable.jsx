import { useState, useEffect } from "react";
import api from "../../utils/api";

const OutstandingPayable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/outstanding-payable");
        setData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch Outstanding Payable:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Outstanding Payable</h2>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Supplier Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Total Purchased</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Total Paid</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Outstanding Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  Loading report...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No outstanding payables found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{item.supplierName}</td>
                  <td className="py-3 px-4 text-gray-600">
                    ₹{(item.totalPurchased || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    ₹{(item.totalPaid || 0).toLocaleString("en-IN")}
                  </td>
                  <td
                    className={`py-3 px-4 font-bold ${
                      item.outstanding > 0 ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    ₹{(item.outstanding || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingPayable;
