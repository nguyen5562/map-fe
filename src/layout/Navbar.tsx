import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, BookOpen, LogOut, User, Shield } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = sessionStorage.getItem("userRole");
  const userName = sessionStorage.getItem("userName") || "Admin";

  const navItems = [
    { path: "/simulation", label: "Mô phỏng", icon: Map },
    { path: "/docs", label: "Tài liệu", icon: BookOpen },
  ];

  if (userRole === "admin") {
    navItems.push({ path: "/admin", label: "Quản trị", icon: Shield });
  }

  const handleLogout = () => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav className="h-12 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center px-4 gap-4 shrink-0 z-[2000] sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <img src="/favicon.ico" alt="Logo" className="w-7 h-7 object-contain" />
        <span className="text-white font-bold text-sm tracking-wide hidden sm:block">
          MÔ PHỎNG KHÍ TÀI PHÁT KHÓI
        </span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active =
            location.pathname === path || location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                active
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + logout */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs border border-white/5 bg-white/5 px-2.5 py-1 rounded-lg">
          <User size={12} className="text-emerald-500" />
          <span className="hidden sm:block font-medium">{userName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 active:scale-[0.98]"
          title="Đăng xuất"
        >
          <LogOut size={13} />
          <span className="hidden sm:block">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
}

