import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const commentsAPI = {
  getComments: async (postId) => {
    const response = await axios.get(`${API_URL}/comments/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (postId, commentData) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(
      `${API_URL}/comments/posts/${postId}/comments`, 
      commentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  likeComment: async (commentId) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(
      `${API_URL}/comments/comments/${commentId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};