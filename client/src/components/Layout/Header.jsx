import React, { useState } from 'react'
import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--surface-color);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: 0 2rem;
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  max-width: 1200px;
  margin: 0 auto;
`

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
`

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`

const NavLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-color);
  }
`

const ThemeButton = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;

  &:hover {
    background: var(--border-color);
  }
`

const Header = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">DD Sphere</Logo>
        
        <NavLinks>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          
          <ThemeButton onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </ThemeButton>

          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  )
}

export default Header