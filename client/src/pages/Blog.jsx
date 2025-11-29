import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { postsAPI } from '../api/posts';

const BlogContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const BlogHeader = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const BlogTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const BlogSubtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const PostCard = styled.article`
  background: var(--surface-color);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 1.5rem;
`;

const PostTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  
  a {
    color: var(--text-color);
    text-decoration: none;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const PostExcerpt = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ReadMore = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 4rem;
  color: #e53e3e;
  font-size: 1.2rem;
`;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPosts();
      setPosts(data.posts);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner>Loading posts...</LoadingSpinner>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <BlogContainer>
      <BlogHeader>
        <BlogTitle>Our Blog</BlogTitle>
        <BlogSubtitle>
          Discover the latest insights, tutorials, and news from the world of technology
        </BlogSubtitle>
      </BlogHeader>

      <PostsGrid>
        {posts.map(post => (
          <PostCard key={post._id}>
            {post.featuredImage?.url && (
              <PostImage 
                src={post.featuredImage.url} 
                alt={post.featuredImage.alt || post.title}
              />
            )}
            <PostContent>
              <PostTitle>
                <Link to={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </PostTitle>
              <PostExcerpt>{post.excerpt}</PostExcerpt>
              <PostMeta>
                <div>
                  <span>By {post.author.username}</span>
                  <span> · {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <ReadMore to={`/blog/${post.slug}`}>
                  Read More →
                </ReadMore>
              </PostMeta>
            </PostContent>
          </PostCard>
        ))}
      </PostsGrid>

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No posts yet</h3>
          <p>Check back later for new content!</p>
        </div>
      )}
    </BlogContainer>
  );
};

export default Blog;