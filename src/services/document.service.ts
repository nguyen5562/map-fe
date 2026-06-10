import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const documentService = {
  getDocumentSections: async () => {
    const response = await api.get(`${API_ROUTES.DOCUMENTS}/sections`);
    return response.data;
  },
  createSection: async (data: any) => {
    const response = await api.post(`${API_ROUTES.DOCUMENTS}/sections`, data);
    return response.data;
  },
  updateSection: async (id: string, data: any) => {
    const response = await api.put(`${API_ROUTES.DOCUMENTS}/sections/${id}`, data);
    return response.data;
  },
  deleteSection: async (id: string) => {
    const response = await api.delete(`${API_ROUTES.DOCUMENTS}/sections/${id}`);
    return response.data;
  },
  createDocument: async (data: any) => {
    const response = await api.post(API_ROUTES.DOCUMENTS, data);
    return response.data;
  },
  updateDocument: async (id: string, data: any) => {
    const response = await api.put(`${API_ROUTES.DOCUMENTS}/${id}`, data);
    return response.data;
  },
  deleteDocument: async (id: string) => {
    const response = await api.delete(`${API_ROUTES.DOCUMENTS}/${id}`);
    return response.data;
  },
};
