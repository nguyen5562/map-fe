import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const vehicleService = {
  getVehicles: async () => {
    const response = await api.get(API_ROUTES.VEHICLES);
    return response.data;
  },
  createVehicle: async (data: any) => {
    const response = await api.post(API_ROUTES.VEHICLES, data);
    return response.data;
  },
  updateVehicle: async (id: string, data: any) => {
    const response = await api.put(`${API_ROUTES.VEHICLES}/${id}`, data);
    return response.data;
  },
  deleteVehicle: async (id: string) => {
    const response = await api.delete(`${API_ROUTES.VEHICLES}/${id}`);
    return response.data;
  },
};
