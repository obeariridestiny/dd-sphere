import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const postsAPI = {
  getPosts: async (params = {}) => {
    const response = await axios.get(`${API_URL}/posts`, { params })
    return response.data
  },

  getPost: async (slug) => {
    const response = await axios.get(`${API_URL}/posts/${slug}`)
    return response.data
  },

  createPost: async (postData) => {
    const token = localStorage.getItem('dd-sphere-token')
    const response = await axios.post(`${API_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}