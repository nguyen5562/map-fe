import axios from "axios";
import { API_URL, API_ROUTES } from "../const/apiConfig";

// ─── Module-level token store ─────────────────────────────────────────────────
// Lưu ở đây để interceptor có thể đọc mà không cần import React context
let _accessToken = "";
let _onUnauthorized: (() => void) | null = null;
let _refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => { _accessToken = ""; };
export const setUnauthorizedHandler = (handler: () => void) => { _onUnauthorized = handler; };

// ─── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // gửi cookie (refresh_token) theo mỗi request
});

// ─── Request interceptor: gắn access token vào header ────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── Response interceptor: tự refresh khi 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Chỉ retry 1 lần, và không retry chính request /auth/refresh (tránh loop)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes(`${API_ROUTES.AUTH}/refresh`)
    ) {
      original._retry = true;

      try {
        // Dùng chung 1 refresh request nếu nhiều request 401 cùng lúc
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post(`${API_URL}${API_ROUTES.AUTH}/refresh`, {}, { withCredentials: true })
            .then((res) => res.data.access_token)
            .finally(() => { _refreshPromise = null; });
        }

        const newToken = await _refreshPromise;
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // retry request ban đầu với token mới
      } catch {
        // Refresh cũng thất bại → session hết hạn, buộc logout
        clearAccessToken();
        _onUnauthorized?.();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
