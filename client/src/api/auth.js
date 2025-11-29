import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
  },

  register: async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
  },

  getMe: async () => {
    const token = localStorage.getItem('dd-sphere-token')
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}