import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const usersAPI = {
  getProfile: async (userId) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.get(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.put(`${API_URL}/users/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getReadingHistory: async () => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.get(`${API_URL}/users/reading-history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  bookmarkPost: async (postId) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(
      `${API_URL}/users/bookmarks/${postId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  removeBookmark: async (postId) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.delete(
      `${API_URL}/users/bookmarks/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};