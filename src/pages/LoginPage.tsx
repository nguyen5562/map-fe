import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  User,
  Lock,
  LifeBuoy,
  FileText,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      toast.success("Đăng nhập thành công!");
      navigate("/simulation");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-[#0d1117]">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-zinc-950">
        {/* Background image constrained to the left panel only */}
        <img
          src="/smoke-bg-2.jpg"
          alt="Diễn tập Binh chủng Hóa học"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />
        {/* Dark overlay gradients inside the left panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full h-full">
          {/* Top logo area */}
          <div className="flex items-center gap-3">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium">
                Quân đội Nhân dân Việt Nam
              </p>
              <p className="text-white font-bold text-sm tracking-wide">
                Binh chủng Hóa học
              </p>
            </div>
          </div>

          {/* Bottom caption */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                Hệ thống mô phỏng
              </span>
            </div>
            <h1 className="text-white text-4xl font-black leading-tight mb-3 drop-shadow-lg">
              Tính toán
              <br />
              <span className="text-emerald-400">Khí tài phát khói</span>
            </h1>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed mb-6">
              Hệ thống hỗ trợ mô phỏng và tính toán phương án triển khai màn
              khói ngụy trang trong tác chiến.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form đăng nhập ── */}
      <div className="flex-1 flex flex-col bg-[#0d1117] border-l border-white/5 relative overflow-hidden z-10">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 flex flex-col flex-1 justify-center pt-12 lg:pt-36 pb-6 px-8 sm:px-12 lg:px-16 max-w-md w-full mx-auto">
          {/* Mobile logo (shown only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-9 h-9 object-contain"
            />
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider">
                Binh chủng Hóa học
              </p>
              <p className="text-white font-bold text-sm">Khí tài phát khói</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            {/* <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest">
                Xác thực danh tính
              </span>
            </div> */}
            <h2 className="text-white text-2xl font-black tracking-wide animate-fade-in">
              ĐĂNG NHẬP HỆ THỐNG
            </h2>
            {/* <p className="text-white/40 text-xs mt-1">
              Chỉ dành cho cán bộ được cấp quyền truy cập
            </p> */}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-1.5 block">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  autoComplete="username"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 text-white placeholder-white/45 text-sm transition-all focus:outline-none focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/25"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="text-white/50 text-[11px] font-semibold uppercase tracking-widest mb-1.5 block">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  autoComplete="current-password"
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 text-white placeholder-white/45 text-sm transition-all focus:outline-none focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-bold text-sm tracking-widest text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 active:scale-[0.98] duration-150"
              style={{
                background: loading
                  ? "#064e3b"
                  : "linear-gradient(135deg, #059669, #10b981)",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(16,185,129,0.25)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ĐANG XÁC THỰC...
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  ĐĂNG NHẬP
                </>
              )}
            </button>
          </form>

          {/* Support and Manual section directly below the button */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
            {/* Hotlines */}
            <div className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                  <LifeBuoy size={12} className="animate-pulse" />
                  <span>Hỗ trợ kỹ thuật</span>
                </div>
                <div className="text-white/45 text-[9px] uppercase tracking-wider pl-[18px] font-semibold pt-[3px]">
                  Trường Sĩ quan Phòng hóa, Binh chủng Hóa học
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-white/60">
                <div className="flex items-center justify-between hover:bg-white/5 px-2 py-1.5 rounded-lg transition">
                  <span>Nguyễn Văn Hưng</span>
                  <span className="font-mono font-bold text-emerald-400">
                    0979.100.804
                  </span>
                </div>
                <div className="flex items-center justify-between hover:bg-white/5 px-2 py-1.5 rounded-lg transition">
                  <span>Nguyễn Khôi Nguyên</span>
                  <span className="font-mono font-bold text-emerald-400">
                    0354.866.976
                  </span>
                </div>
              </div>
            </div>

            {/* User Manual Button */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info(
                  "Chức năng tải tài liệu hướng dẫn sẽ khả dụng khi tệp tin được cập nhật.",
                );
              }}
              className="flex items-center justify-between bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 text-white/80 hover:text-emerald-300 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <FileText size={13} className="text-emerald-500/70" />
                <span>Tài liệu hướng dẫn sử dụng</span>
              </div>
              <Download
                size={13}
                className="text-white/40 hover:text-white/70 transition-colors"
              />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-8 py-4 border-t border-white/5 mt-auto">
          <p className="text-white/20 text-[10px] text-center">
            © 2026 - Trường Sĩ quan Phòng hóa, Binh chủng Hóa học
          </p>
        </div>
      </div>
    </div>
  );
}
