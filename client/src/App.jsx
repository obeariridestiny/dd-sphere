import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Post from './pages/Post'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Editor from './pages/Editor'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
        <Route path="/analytics" element={user ? <Analytics /> : <Login />} />
        <Route path="/editor" element={user ? <Editor /> : <Login />} />
      </Routes>
    </Layout>
  )
}

export default App