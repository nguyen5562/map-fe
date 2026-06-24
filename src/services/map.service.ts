import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const mapService = {
  getAllMaps: async (userId?: string) => {
    const url = userId
      ? `${API_ROUTES.MAP}/all?userId=${userId}`
      : API_ROUTES.MAP + "/all";
    const response = await api.get(url);
    return response.data;
  },

  getMapById: async (id: string) => {
    const response = await api.get(API_ROUTES.MAP + `/${id}`);
    return response.data;
  },

  uploadMap: async (
    file: File,
    userId?: string,
    onProgress?: (percent: number) => void,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (userId) {
      formData.append("userId", userId);
    }
    const response = await api.post(API_ROUTES.MAP + "/upload", formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  calibrateMap: async (mapId: string, calibrationData: any) => {
    const response = await api.post(API_ROUTES.MAP + "/calibrate", {
      mapId,
      calibrationData,
    });
    return response.data;
  },

  renameMap: async (mapId: string, name: string) => {
    const response = await api.put(API_ROUTES.MAP + `/${mapId}`, { name });
    return response.data;
  },

  deleteMap: async (mapId: string) => {
    const response = await api.delete(API_ROUTES.MAP + `/${mapId}`);
    return response.data;
  },
};
