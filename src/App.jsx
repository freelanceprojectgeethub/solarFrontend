import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import CompanyMaster from "./pages/masters/CompanyMaster";
import BrandMaster from "./pages/masters/BrandMaster";
import UnitMaster from "./pages/masters/UnitMaster";
import GstMaster from "./pages/masters/GstMaster";
import CategoryMaster from "./pages/masters/CategoryMaster";
import BankMaster from "./pages/masters/BankMaster";
import SupplierMaster from "./pages/masters/SupplierMaster";
import CustomerMaster from "./pages/masters/CustomerMaster";
import ItemMaster from "./pages/masters/ItemMaster";
import RoleMaster from "./pages/masters/RoleMaster";
import UserMaster from "./pages/masters/UserMaster";
import PurchaseEntry from "./pages/transactions/PurchaseEntry";
import FuturePurchaseEntry from "./pages/transactions/FuturePurchaseEntry";
import SaleEntry from "./pages/transactions/SaleEntry";
import FutureSaleEntry from "./pages/transactions/FutureSaleEntry";
import PaymentEntry from "./pages/transactions/PaymentEntry";
import ReceiptEntry from "./pages/transactions/ReceiptEntry";
import PurchaseRegister from "./pages/reports/PurchaseRegister";
import SalesRegister from "./pages/reports/SalesRegister";
import FuturePurchaseReport from "./pages/reports/FuturePurchaseReport";
import FutureSalesReport from "./pages/reports/FutureSalesReport";
import PaymentRegister from "./pages/reports/PaymentRegister";
import ReceiptRegister from "./pages/reports/ReceiptRegister";
import SupplierLedger from "./pages/reports/SupplierLedger";
import CustomerLedger from "./pages/reports/CustomerLedger";
import OutstandingPayable from "./pages/reports/OutstandingPayable";
import OutstandingReceivable from "./pages/reports/OutstandingReceivable";
import ProductWiseReport from "./pages/reports/ProductWiseReport";
import BrandWiseReport from "./pages/reports/BrandWiseReport";
import GstSummary from "./pages/reports/GstSummary";
import ProfitMarginReport from "./pages/reports/ProfitMarginReport";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <CompanyMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters"
            element={
              <ProtectedRoute>
                <CompanyMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/company"
            element={
              <ProtectedRoute>
                <CompanyMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brands"
            element={
              <ProtectedRoute>
                <BrandMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/units"
            element={
              <ProtectedRoute>
                <UnitMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gst"
            element={
              <ProtectedRoute>
                <GstMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/banks"
            element={
              <ProtectedRoute>
                <BankMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SupplierMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <ItemMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <RoleMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchaseEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/future-purchases"
            element={
              <ProtectedRoute>
                <FuturePurchaseEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <SaleEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/future-sales"
            element={
              <ProtectedRoute>
                <FutureSaleEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipts"
            element={
              <ProtectedRoute>
                <ReceiptEntry />
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports/purchase"
            element={
              <ProtectedRoute>
                <PurchaseRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/sales"
            element={
              <ProtectedRoute>
                <SalesRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/future-purchase"
            element={
              <ProtectedRoute>
                <FuturePurchaseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/future-sales"
            element={
              <ProtectedRoute>
                <FutureSalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/payment"
            element={
              <ProtectedRoute>
                <PaymentRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/receipt"
            element={
              <ProtectedRoute>
                <ReceiptRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/supplier-ledger"
            element={
              <ProtectedRoute>
                <SupplierLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/customer-ledger"
            element={
              <ProtectedRoute>
                <CustomerLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/outstanding-payable"
            element={
              <ProtectedRoute>
                <OutstandingPayable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/outstanding-receivable"
            element={
              <ProtectedRoute>
                <OutstandingReceivable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/product-wise"
            element={
              <ProtectedRoute>
                <ProductWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/brand-wise"
            element={
              <ProtectedRoute>
                <BrandWiseReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/gst-summary"
            element={
              <ProtectedRoute>
                <GstSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/profit-margin"
            element={
              <ProtectedRoute>
                <ProfitMarginReport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
