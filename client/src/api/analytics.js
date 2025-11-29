import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const analyticsAPI = {
  trackPageView: async (data) => {
    const response = await axios.post(`${API_URL}/analytics/track`, data);
    return response.data;
  },

  getOverview: async () => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.get(`${API_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};