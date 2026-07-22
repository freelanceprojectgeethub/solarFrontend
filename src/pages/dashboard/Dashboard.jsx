import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => {
        setData(res.data.data || res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
          <div className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const totalSalesAmount =
    data?.sales?.totalSalesAmount ?? data?.totalSalesAmount ?? 0;
  const totalSalesCount =
    data?.sales?.totalSalesCount ?? data?.totalSalesCount ?? 0;
  const totalPurchaseAmount =
    data?.purchases?.totalPurchaseAmount ?? data?.totalPurchaseAmount ?? 0;
  const totalPurchaseCount =
    data?.purchases?.totalPurchaseCount ?? data?.totalPurchaseCount ?? 0;
  const totalReceiptAmount =
    data?.receipts?.totalReceiptAmount ?? data?.totalReceiptAmount ?? 0;
  const totalPaymentAmount =
    data?.payments?.totalPaymentAmount ?? data?.totalPaymentAmount ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalSalesAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalSalesCount} transactions
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Purchases Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Purchases</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalPurchaseAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {totalPurchaseCount} transactions
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Receipts Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Receipts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalReceiptAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">Collected</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Payments Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{totalPaymentAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-400 mt-1">Paid</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
