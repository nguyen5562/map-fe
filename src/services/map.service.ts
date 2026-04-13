import { api } from './api';
import { API_ROUTES } from '../const/apiConfig';

export const mapService = {
  getAllMaps: async () => {
    const response = await api.get(API_ROUTES.MAP + '/all');
    return response.data;
  },

  getMapById: async (id: string) => {
    const response = await api.get(API_ROUTES.MAP + `/${id}`);
    return response.data;
  },

  uploadMap: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(API_ROUTES.MAP + '/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  calibrateMap: async (mapId: string, calibrationData: any) => {
    const response = await api.post(API_ROUTES.MAP + '/calibrate', {
      mapId,
      calibrationData
    });
    return response.data;
  }
};
