import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post(`${API_ROUTES.AUTH}/login`, credentials);
    return response.data;
  },

  refresh: async (): Promise<{ access_token: string }> => {
    const response = await api.post(`${API_ROUTES.AUTH}/refresh`);
    return response.data;
  },

  logout: async () => {
    const response = await api.post(`${API_ROUTES.AUTH}/logout`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get(`${API_ROUTES.AUTH}/me`);
    return response.data;
  },
};
