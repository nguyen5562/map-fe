import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post(`${API_ROUTES.AUTH}/login`, credentials);
    return response.data;
  },
};
