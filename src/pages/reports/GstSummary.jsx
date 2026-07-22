import { useState, useEffect } from "react";
import api from "../../utils/api";

const GstSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports/gst-summary");
        setData(res.data.data || null);
      } catch (err) {
        console.error("Failed to fetch GST Summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const cards = [
    {
      title: "Total CGST",
      value: data?.totalCgst || 0,
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Total SGST",
      value: data?.totalSgst || 0,
      borderColor: "border-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Total IGST",
      value: data?.totalIgst || 0,
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Total GST",
      value: data?.totalGST || 0,
      borderColor: "border-orange-500",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">GST Summary</h2>

      {loading ? (
        <p className="text-gray-500">Loading summary...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${card.borderColor}`}
            >
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {card.title}
              </p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                ₹{card.value.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GstSummary;
