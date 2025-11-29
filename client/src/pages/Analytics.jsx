import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AnalyticsContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
`;

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('dd-sphere-token');
      const response = await fetch('/api/analytics/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <AnalyticsContainer>
      <h1>Analytics Dashboard</h1>
      
      <StatsGrid>
        <StatCard>
          <h3>Total Posts</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analytics.overview.totalPosts}
          </p>
        </StatCard>
        
        <StatCard>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analytics.overview.totalUsers}
          </p>
        </StatCard>
        
        <StatCard>
          <h3>Page Views</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analytics.overview.totalPageViews}
          </p>
        </StatCard>
        
        <StatCard>
          <h3>Engagement Rate</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {analytics.overview.averageEngagement}%
          </p>
        </StatCard>
      </StatsGrid>

      <div>
        <h2>Recent Posts Performance</h2>
        {analytics.recentPosts.map(post => (
          <div key={post._id} style={{ 
            background: 'var(--surface-color)', 
            padding: '1rem', 
            marginBottom: '1rem',
            borderRadius: '8px'
          }}>
            <h4>{post.title}</h4>
            <p>Views: {post.analytics.views} | Likes: {post.analytics.likes}</p>
          </div>
        ))}
      </div>
    </AnalyticsContainer>
  );
};

export default Analytics;