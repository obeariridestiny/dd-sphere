import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const HeroSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color)20, #764ba220);
  padding: 6rem 2rem;
  text-align: center;
`

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
`

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-color), #764ba2);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`

const Home = () => {
  return (
    <>
      <HeroSection>
        <HeroTitle>Welcome to DD Sphere</HeroTitle>
        <HeroSubtitle>
          Your premier destination for cutting-edge technology insights, 
          expert programming tutorials, and the latest digital innovation trends.
        </HeroSubtitle>
        <CTAButton to="/blog">
          Explore Articles
        </CTAButton>
      </HeroSection>
    </>
  )
}

export default Home