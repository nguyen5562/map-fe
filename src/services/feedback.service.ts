import { api } from "./api";
import { API_ROUTES } from "../const/apiConfig";

export const feedbackService = {
  createFeedback: async (data: { type: string; title: string; content: string }) => {
    const response = await api.post(API_ROUTES.FEEDBACK, data);
    return response.data;
  },

  getMyFeedbacks: async () => {
    const response = await api.get(`${API_ROUTES.FEEDBACK}/my`);
    return response.data;
  },

  getAllFeedbacks: async () => {
    const response = await api.get(`${API_ROUTES.FEEDBACK}/admin/all`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`${API_ROUTES.FEEDBACK}/admin/${id}/status`, { status });
    return response.data;
  },

  addReply: async (feedbackId: string, content: string) => {
    const response = await api.post(`${API_ROUTES.FEEDBACK}/${feedbackId}/reply`, { content });
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get(`${API_ROUTES.FEEDBACK}/notifications`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`${API_ROUTES.FEEDBACK}/${id}/read`);
    return response.data;
  },
};
