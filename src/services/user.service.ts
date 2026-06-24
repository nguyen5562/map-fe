import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const userService = {
  getUsers: async () => {
    const response = await api.get(API_ROUTES.USERS);
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post(API_ROUTES.USERS, data);
    return response.data;
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.put(`${API_ROUTES.USERS}/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`${API_ROUTES.USERS}/${id}`);
    return response.data;
  },
  changePassword: async (id: string, data: any) => {
    const response = await api.put(
      `${API_ROUTES.USERS}/${id}/change-password`,
      data,
    );
    return response.data;
  },
};
