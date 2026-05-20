import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { LayoutDashboard, CreditCard, User, LogOut } from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/accounts", label: "Accounts", icon: CreditCard },
  { to: "/profile", label: "My Profile", icon: User },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className="w-56 flex-shrink-0 flex flex-col"
        style={{ background: "#0f2419" }}
      >
        <div className="px-6 py-7">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0"
            >
              <span className="font-bold text-xs" style={{ color: "#0f2419" }}>
                FD
              </span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              FinDash
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/8"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-3">
            <p className="text-xs font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/50 text-sm hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-stone-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
