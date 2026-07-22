import { useState, useEffect } from "react";
import api from "../../utils/api";

const BrandWiseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/brand-wise");
        setData(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch Brand Wise Report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Brand Wise Report</h2>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Brand Name</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Total Quantity</th>
              <th className="py-3 px-4 font-semibold text-sm text-gray-700">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500">
                  Loading report...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-gray-500">
                  No data found.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{item.brandName}</td>
                  <td className="py-3 px-4 text-gray-600">{item.totalQuantity}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{(item.totalAmount || 0).toLocaleString("en-IN")}
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

export default BrandWiseReport;
