import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const WelcomeSection = styled.section`
  background: linear-gradient(135deg, var(--primary-color)20, #764ba220);
  padding: 3rem;
  border-radius: 12px;
  margin-bottom: 3rem;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const WelcomeText = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ActionCard = styled(Link)`
  background: var(--surface-color);
  padding: 2rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ActionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome back, {user?.username}! 👋</WelcomeTitle>
        <WelcomeText>
          Here's what's happening with your DD Sphere account today.
        </WelcomeText>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <h3>Posts Read</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</p>
        </StatCard>
        <StatCard>
          <h3>Engagement Points</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {user?.engagement?.points || 0}
          </p>
        </StatCard>
        <StatCard>
          <h3>Your Level</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {user?.engagement?.level || 'beginner'}
          </p>
        </StatCard>
        <StatCard>
          <h3>Bookmarks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>5</p>
        </StatCard>
      </StatsGrid>

      <ActionGrid>
        <ActionCard to="/blog">
          <ActionTitle>📚 Read Blog</ActionTitle>
          <p>Explore our latest articles and tutorials</p>
        </ActionCard>

        <ActionCard to="/editor">
          <ActionTitle>✏️ Write Post</ActionTitle>
          <p>Create and publish your own content</p>
        </ActionCard>

        <ActionCard to="/analytics">
          <ActionTitle>📊 View Analytics</ActionTitle>
          <p>Check your content performance</p>
        </ActionCard>

        {user?.role === 'admin' && (
          <ActionCard to="/admin">
            <ActionTitle>⚙️ Admin Panel</ActionTitle>
            <p>Manage users and content</p>
          </ActionCard>
        )}
      </ActionGrid>
    </DashboardContainer>
  );
};

export default Dashboard;