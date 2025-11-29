import React from 'react'
import styled from 'styled-components'

const FooterContainer = styled.footer`
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
`

const Footer = () => {
  return (
    <FooterContainer>
      <p>&copy; 2024 DD Sphere. All rights reserved.</p>
      <p>Premium Tech Blogging Platform</p>
    </FooterContainer>
  )
}

export default Footer