import axios from 'axios';

const API_URL = 'http://localhost:3000/api/map';

export const mapService = {
  getAllMaps: async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
  },

  getMapById: async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  uploadMap: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload`, formData, {
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
    const response = await axios.post(`${API_URL}/calibrate`, {
      mapId,
      calibrationData
    });
    return response.data;
  }
};
