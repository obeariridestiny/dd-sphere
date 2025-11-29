import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const quizzesAPI = {
  getQuizzes: async (params = {}) => {
    const response = await axios.get(`${API_URL}/quizzes`, { params });
    return response.data;
  },

  getQuiz: async (id) => {
    const response = await axios.get(`${API_URL}/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (quizData) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(`${API_URL}/quizzes`, quizData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  submitAttempt: async (quizId, attemptData) => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.post(
      `${API_URL}/quizzes/${quizId}/attempt`,
      attemptData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  getUserAttempts: async () => {
    const token = localStorage.getItem('dd-sphere-token');
    const response = await axios.get(`${API_URL}/quizzes/user/attempts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};