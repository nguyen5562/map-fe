import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/auth.service";
import { setAccessToken, clearAccessToken, setUnauthorizedHandler } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthUser {
  id: string;
  username: string;
  name: string | null;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true trong khi đang kiểm tra session (F5)
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // bắt đầu loading để kiểm tra session

  const clearAuth = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  // Đăng ký handler: khi refresh thất bại trong interceptor → logout
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      window.location.href = "/login";
    });
  }, [clearAuth]);

  // F5 / mở tab mới → thử khôi phục session từ cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { access_token } = await authService.refresh();
        setAccessToken(access_token);
        const me = await authService.getMe();
        setUser(me);
      } catch {
        // Không có cookie hợp lệ → chưa đăng nhập, bình thường
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    const data = await authService.login(credentials);
    setAccessToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Dù lỗi vẫn xóa state local
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}
