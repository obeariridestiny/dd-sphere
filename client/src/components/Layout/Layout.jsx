import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: all 0.3s ease;
`

const Main = styled.main`
  flex: 1;
  padding-top: 80px;
`

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        {children}
      </Main>
      <Footer />
    </LayoutContainer>
  )
}

export default Layout