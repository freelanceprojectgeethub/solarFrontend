import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Package,
  Tag,
  FolderTree,
  Ruler,
  Truck,
  Users,
  Landmark,
  Percent,
  ShieldCheck,
  UserCog,
  ShoppingCart,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  Receipt,
  CalendarClock,
  LineChart,
  CreditCard,
  Wallet,
  BookOpen,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Boxes,
  Tags,
  FileCheck,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  Settings,
  Zap
} from "lucide-react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navGroups = [
    {
      title: "Overview",
      items: [
        { name: "Dashboard", path: "/", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "Masters",
      items: [
        { name: "Companies", path: "/companies", icon: Building2 },
        { name: "Items", path: "/items", icon: Package },
        { name: "Brands", path: "/brands", icon: Tag },
        { name: "Categories", path: "/categories", icon: FolderTree },
        { name: "Units", path: "/units", icon: Ruler },
        { name: "Suppliers", path: "/suppliers", icon: Truck },
        { name: "Customers", path: "/customers", icon: Users },
        { name: "Banks", path: "/banks", icon: Landmark },
        { name: "GST Rates", path: "/gst", icon: Percent },
      ],
    },
    {
      title: "Transactions",
      items: [
        { name: "Purchases", path: "/purchases", icon: ShoppingCart },
        { name: "Future Purchases", path: "/future-purchases", icon: Clock },
        { name: "Sales", path: "/sales", icon: DollarSign },
        { name: "Future Sales", path: "/future-sales", icon: TrendingUp },
        { name: "Payments", path: "/payments", icon: ArrowUpRight },
        { name: "Receipts", path: "/receipts", icon: ArrowDownLeft },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Purchase Register", path: "/reports/purchase", icon: FileSpreadsheet },
        { name: "Sales Register", path: "/reports/sales", icon: Receipt },
        { name: "Future Purchase", path: "/reports/future-purchase", icon: CalendarClock },
        { name: "Future Sales", path: "/reports/future-sales", icon: LineChart },
        { name: "Payment Register", path: "/reports/payment", icon: CreditCard },
        { name: "Receipt Register", path: "/reports/receipt", icon: Wallet },
        { name: "Supplier Ledger", path: "/reports/supplier-ledger", icon: BookOpen },
        { name: "Customer Ledger", path: "/reports/customer-ledger", icon: UserCheck },
        { name: "Outstanding Payable", path: "/reports/outstanding-payable", icon: AlertCircle },
        { name: "Outstanding Receivable", path: "/reports/outstanding-receivable", icon: CheckCircle2 },
        { name: "Product Wise", path: "/reports/product-wise", icon: Boxes },
        { name: "Brand Wise", path: "/reports/brand-wise", icon: Tags },
        { name: "GST Summary", path: "/reports/gst-summary", icon: FileCheck },
        { name: "Profit Margin", path: "/reports/profit-margin", icon: BarChart3 },
      ],
    },
    {
      title: "Settings",
      items: [
        { name: "Roles", path: "/roles", icon: ShieldCheck },
        { name: "Users", path: "/users", icon: UserCog },
      ],
    },
  ];

  // Helper to format breadcrumb title based on current path
  const getPageTitle = () => {
    const currentPath = location.pathname;
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === currentPath) return item.name;
      }
    }
    if (currentPath === "/") return "Dashboard";
    return "Solar SaaS";
  };

  // Get current breadcrumb group
  const getBreadcrumbGroup = () => {
    const currentPath = location.pathname;
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.path === currentPath) return group.title;
      }
    }
    return "";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#EDEEF1] p-2.5 gap-2.5">
      {/* Sidebar */}
      <aside
        className={`bg-[#111113] text-white flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out relative z-30 rounded-2xl overflow-hidden ${
          collapsed ? "w-[72px]" : "w-[252px]"
        }`}
      >
        {/* Brand Header */}
        <div className={`h-[60px] flex items-center justify-between border-b border-white/[0.06] ${collapsed ? "px-3" : "px-5"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FD4B23] to-[#FF8A5C] flex items-center justify-center shadow-lg shadow-[#FD4B23]/20 flex-shrink-0">
              <Sun className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-bold tracking-tight text-white">
                  Solar SaaS
                </span>
                <span className="text-[9px] font-bold text-[#FD4B23] tracking-[0.15em] uppercase">
                  Enterprise
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors hidden md:flex items-center justify-center"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Nav Items */}
        <nav className={`flex-1 py-4 overflow-y-auto sidebar-scroll ${collapsed ? "px-2" : "px-3"}`}>
          <div className="space-y-5">
            {navGroups.map((group, idx) => (
              <div key={idx}>
                {!collapsed && (
                  <h2 className="px-3 text-[10px] font-bold text-white/25 uppercase tracking-[0.12em] mb-1.5">
                    {group.title}
                  </h2>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) =>
                          `sidebar-link ${isActive ? "active" : ""} ${
                            collapsed ? "justify-center px-0 py-2" : ""
                          }`
                        }
                        title={collapsed ? item.name : undefined}
                      >
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Footer */}
        <div className={`border-t border-white/[0.06] ${collapsed ? "p-2" : "p-3"}`}>
          {!collapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FD4B23] to-[#FF8A5C] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col truncate leading-tight">
                  <span className="text-[12px] font-semibold text-white/90 truncate">
                    {user?.name || "Lalit Agrawal"}
                  </span>
                  <span className="text-[10px] text-white/35 truncate">
                    {user?.roleId?.name || "Super Admin"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full py-2 flex justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white rounded-2xl border border-gray-200/50">
        {/* Top Header Bar */}
        <header className="h-[56px] bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-20 rounded-t-2xl flex-shrink-0">
          {/* Left: Breadcrumb & Title */}
          <div className="flex items-center gap-2.5">
            {getBreadcrumbGroup() && (
              <>
                <span className="text-xs font-medium text-gray-400">
                  {getBreadcrumbGroup()}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-300" />
              </>
            )}
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-lg focus:outline-none focus:border-[#FD4B23]/40 focus:bg-white focus:ring-1 focus:ring-[#FD4B23]/10 w-48 transition-all font-medium text-gray-600 placeholder:text-gray-400"
              />
            </div>

            {/* Notification Icon */}
            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="w-1.5 h-1.5 bg-[#FD4B23] rounded-full absolute top-1.5 right-1.5 ring-2 ring-white"></span>
            </button>

            <div className="h-5 w-px bg-gray-200/80"></div>

            {/* Company Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/60 text-[11px] font-semibold text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Lalit Solar</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FD4B23] to-[#FF8A5C] text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "L"}
                </div>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${profileDropdown ? "rotate-180" : ""}`} />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg shadow-black/8 border border-gray-200/80 py-1 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user?.name || "Lalit Agrawal"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">
                      {user?.email || "lalit@solar.com"}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        navigate("/users");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>My Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        navigate("/roles");
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2.5 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 bg-[#F6F7F9] px-5 py-6 lg:px-8 lg:py-8 overflow-y-auto custom-scrollbar animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;