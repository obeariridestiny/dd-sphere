import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const seoAPI = {
  analyze: async (data) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(`${API_URL}/seo/analyze`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  analyzeBulk: async (posts) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(`${API_URL}/seo/analyze-bulk`, { posts }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};