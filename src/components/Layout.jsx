import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block py-2 px-4 rounded text-sm transition-colors ${
      isActive
        ? "bg-gray-800 text-white font-semibold"
        : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
    }`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen flex-shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Solar SaaS</h1>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* MASTERS */}
          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Masters
            </h2>
            <div className="space-y-1">
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/companies" className={linkClass}>
                Companies
              </NavLink>
              <NavLink to="/items" className={linkClass}>
                Items
              </NavLink>
              <NavLink to="/brands" className={linkClass}>
                Brands
              </NavLink>
              <NavLink to="/categories" className={linkClass}>
                Categories
              </NavLink>
              <NavLink to="/units" className={linkClass}>
                Units
              </NavLink>
              <NavLink to="/suppliers" className={linkClass}>
                Suppliers
              </NavLink>
              <NavLink to="/customers" className={linkClass}>
                Customers
              </NavLink>
              <NavLink to="/banks" className={linkClass}>
                Banks
              </NavLink>
              <NavLink to="/gst" className={linkClass}>
                GST
              </NavLink>
              <NavLink to="/roles" className={linkClass}>
                Roles
              </NavLink>
              <NavLink to="/users" className={linkClass}>
                Users
              </NavLink>
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Transactions
            </h2>
            <div className="space-y-1">
              <NavLink to="/purchases" className={linkClass}>
                Purchases
              </NavLink>
              <NavLink to="/future-purchases" className={linkClass}>
                Future Purchases
              </NavLink>
              <NavLink to="/sales" className={linkClass}>
                Sales
              </NavLink>
              <NavLink to="/future-sales" className={linkClass}>
                Future Sales
              </NavLink>
              <NavLink to="/payments" className={linkClass}>
                Payments
              </NavLink>
              <NavLink to="/receipts" className={linkClass}>
                Receipts
              </NavLink>
            </div>
          </div>

          {/* REPORTS */}
          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Reports
            </h2>
            <div className="space-y-1">
              <NavLink to="/reports/purchase" className={linkClass}>
                Purchase Register
              </NavLink>
              <NavLink to="/reports/sales" className={linkClass}>
                Sales Register
              </NavLink>
              <NavLink to="/reports/future-purchase" className={linkClass}>
                Future Purchase Report
              </NavLink>
              <NavLink to="/reports/future-sales" className={linkClass}>
                Future Sales Report
              </NavLink>
              <NavLink to="/reports/payment" className={linkClass}>
                Payment Register
              </NavLink>
              <NavLink to="/reports/receipt" className={linkClass}>
                Receipt Register
              </NavLink>
              <NavLink to="/reports/supplier-ledger" className={linkClass}>
                Supplier Ledger
              </NavLink>
              <NavLink to="/reports/customer-ledger" className={linkClass}>
                Customer Ledger
              </NavLink>
              <NavLink to="/reports/outstanding-payable" className={linkClass}>
                Outstanding Payable
              </NavLink>
              <NavLink to="/reports/outstanding-receivable" className={linkClass}>
                Outstanding Receivable
              </NavLink>
              <NavLink to="/reports/product-wise" className={linkClass}>
                Product Wise Report
              </NavLink>
              <NavLink to="/reports/brand-wise" className={linkClass}>
                Brand Wise Report
              </NavLink>
              <NavLink to="/reports/gst-summary" className={linkClass}>
                GST Summary
              </NavLink>
              <NavLink to="/reports/profit-margin" className={linkClass}>
                Profit Margin Report
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 text-left text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;