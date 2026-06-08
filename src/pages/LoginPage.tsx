import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 700));
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("auth", "true");
      navigate("/simulation");
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── LEFT PANEL: Ảnh nền diễn tập ── */}
      <div className="hidden lg:flex lg:w-3/5 relative">
        {/* Background image */}
        <img
          src="/smoke-bg-2.jpg"
          alt="Diễn tập Binh chủng Hóa học"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
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
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Hệ thống hỗ trợ mô phỏng và tính toán phương án triển khai màn
              khói ngụy trang trong tác chiến.
            </p>

            {/* <div className="mt-6 flex items-center gap-6">
              <div className="text-center">
                <p className="text-yellow-400 font-black text-xl">BÍ MẬT</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Cấp độ bảo mật</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-white font-bold text-sm">PHÒNG HÓA</p>
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Đơn vị sử dụng</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form đăng nhập ── */}
      <div className="flex-1 flex flex-col bg-[#0d1117] relative overflow-hidden">
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Glow accent top-right */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-1 justify-center px-8 sm:px-12 lg:px-16 max-w-md w-full mx-auto">
          {/* Mobile logo (shown only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
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
          {/* <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 bg-yellow-400 rounded-full" />
              <span className="text-yellow-400 text-xs font-semibold uppercase tracking-widest">
                Xác thực danh tính
              </span>
            </div>
            <h2 className="text-white text-2xl font-black tracking-wide">ĐĂNG NHẬP HỆ THỐNG</h2>
            <p className="text-white/40 text-xs mt-1">Chỉ dành cho cán bộ được cấp quyền truy cập</p>
          </div> */}

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
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

            {/* Password */}
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
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
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

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-bold text-sm tracking-widest text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading
                  ? "#064e3b"
                  : "linear-gradient(135deg, #059669, #10b981)",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(16,185,129,0.35)",
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

          {/* Divider + security note */}
          {/* <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-white/20 text-[10px] text-center leading-relaxed uppercase tracking-wider">
              Hệ thống bảo mật — Mọi hoạt động đều được ghi lại nhật ký
            </p>
          </div> */}
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-8 py-4 border-t border-white/5">
          <p className="text-white/20 text-[10px] text-center">
            © 2026 Binh chủng Hóa học — Quân đội Nhân dân Việt Nam
          </p>
        </div>
      </div>
    </div>
  );
}
