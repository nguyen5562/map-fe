import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const documentService = {
  getDocumentSections: async (type?: string) => {
    const response = await api.get(`${API_ROUTES.DOCUMENTS}/sections`, {
      params: type ? { type } : undefined,
    });
    return response.data;
  },
  createSection: async (data: any) => {
    const response = await api.post(`${API_ROUTES.DOCUMENTS}/sections`, data);
    return response.data;
  },
  updateSection: async (id: string, data: any) => {
    const response = await api.put(
      `${API_ROUTES.DOCUMENTS}/sections/${id}`,
      data,
    );
    return response.data;
  },
  deleteSection: async (id: string) => {
    const response = await api.delete(`${API_ROUTES.DOCUMENTS}/sections/${id}`);
    return response.data;
  },
  uploadFile: async (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `${API_ROUTES.DOCUMENTS}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress,
      },
    );
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
  reorderDocuments: async (sectionId: string, orderedIds: string[]) => {
    const response = await api.patch(
      `${API_ROUTES.DOCUMENTS}/sections/${sectionId}/reorder`,
      { orderedIds },
    );
    return response.data;
  },
};
