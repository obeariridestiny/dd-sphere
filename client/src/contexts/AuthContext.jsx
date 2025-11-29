import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('dd-sphere-token')
      if (token) {
        const userData = await authAPI.getMe()
        setUser(userData)
      }
    } catch (error) {
      localStorage.removeItem('dd-sphere-token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { user: userData, token } = await authAPI.login({ email, password })
    localStorage.setItem('dd-sphere-token', token)
    setUser(userData)
    return userData
  }

  const register = async (userData) => {
    const { user: newUser, token } = await authAPI.register(userData)
    localStorage.setItem('dd-sphere-token', token)
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    localStorage.removeItem('dd-sphere-token')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}