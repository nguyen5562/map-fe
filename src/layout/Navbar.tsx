import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Map, BookOpen, LogOut, User, Shield, ChevronDown, Key, X, Eye, EyeOff, Lock } from "lucide-react";
import { userService } from "../services/user.service";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const userRole = user?.role;
  const userName = user?.name || user?.username || "Admin";
  const userId = user?.id;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Show/Hide Password States
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navItems = [
    { path: "/simulation", label: "Mô phỏng", icon: Map },
    { path: "/docs", label: "Tài liệu", icon: BookOpen },
  ];

  if (userRole === "admin") {
    navItems.push({ path: "/admin", label: "Quản trị", icon: Shield });
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Không tìm thấy thông tin phiên đăng nhập.");
      return;
    }
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới nhập lại không khớp.");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Mật khẩu mới phải có ít nhất 4 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(userId, { oldPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      setChangePasswordOpen(false);
      // Reset form fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ."
      );
    } finally {
      setLoading(false);
    }
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

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all active:scale-[0.98] select-none"
        >
          <User size={12} className="text-emerald-500" />
          <span className="font-semibold">{userName}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <>
            {/* Click-outside backdrop */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setDropdownOpen(false)} 
            />
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-1.5 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-40 text-xs">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Key size={13} className="text-emerald-600" />
                Đổi mật khẩu
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5 font-semibold"
              >
                <LogOut size={13} />
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {changePasswordOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-slate-200">
              <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                <Key size={16} className="text-emerald-600" />
                ĐỔI MẬT KHẨU
              </h4>
              <button
                type="button"
                onClick={() => setChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-5 space-y-4 text-xs">
              {/* Mật khẩu cũ */}
              <div>
                <label className="text-slate-600 font-semibold mb-1.5 block">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showOldPass ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại..."
                    className="w-full h-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-lg pl-8 pr-9 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition"
                  >
                    {showOldPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <label className="text-slate-600 font-semibold mb-1.5 block">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full h-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-lg pl-8 pr-9 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-600 transition"
                  >
                    {showNewPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div>
                <label className="text-slate-600 font-semibold mb-1.5 block">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full h-9 bg-white border border-slate-300 hover:border-slate-400 focus:border-emerald-500 rounded-lg pl-8 pr-9 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-600 transition"
                  >
                    {showConfirmPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-200 mt-5">
                <button
                  type="button"
                  onClick={() => setChangePasswordOpen(false)}
                  className="h-8 px-4 rounded-lg text-xs border border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-8 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}

