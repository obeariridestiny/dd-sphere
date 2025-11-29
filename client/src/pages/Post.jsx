import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../api/posts';
import CommentSection from '../components/Comments/CommentSection';

const PostContainer = styled.article`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const PostHeader = styled.header`
  margin-bottom: 2rem;
  text-align: center;
`;

const PostTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FeaturedImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const PostContent = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;
  
  h2, h3, h4 {
    margin: 2rem 0 1rem 0;
    color: var(--text-color);
  }
  
  p {
    margin-bottom: 1.5rem;
  }
  
  code {
    background: var(--surface-color);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
  
  pre {
    background: var(--surface-color);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 1rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: var(--text-secondary);
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-color);
    color: white;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const Tag = styled.span`
  background: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
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

const Post = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const postData = await postsAPI.getPost(slug);
      setPost(postData);
    } catch (err) {
      setError('Post not found');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // You'll need to implement the like API endpoint
      console.log('Liking post:', post._id);
      // Update local state optimistically
      setPost(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          likes: prev.analytics.likes + 1
        }
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // You'll need to implement the bookmark API endpoint
      console.log('Bookmarking post:', post._id);
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner>Loading post...</LoadingSpinner>;
  }

  if (error) {
    return (
      <ErrorMessage>
        <p>{error}</p>
        <Link to="/blog" style={{ color: 'var(--primary-color)', marginTop: '1rem', display: 'block' }}>
          ← Back to Blog
        </Link>
      </ErrorMessage>
    );
  }

  if (!post) {
    return <ErrorMessage>Post not found</ErrorMessage>;
  }

  return (
    <PostContainer>
      <PostHeader>
        <PostTitle>{post.title}</PostTitle>
        
        <PostMeta>
          <MetaItem>
            <span>By {post.author.username}</span>
          </MetaItem>
          <MetaItem>
            <span>📅</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </MetaItem>
          <MetaItem>
            <span>⏱️</span>
            <span>{post.readingTime} min read</span>
          </MetaItem>
          <MetaItem>
            <span>👁️</span>
            <span>{post.analytics.views} views</span>
          </MetaItem>
        </PostMeta>

        {post.featuredImage?.url && (
          <FeaturedImage 
            src={post.featuredImage.url} 
            alt={post.featuredImage.alt || post.title}
          />
        )}

        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '1rem'
        }}>
          {post.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <TagsContainer>
            {post.tags.map(tag => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </TagsContainer>
        )}
      </PostHeader>

      <PostContent dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />

      <PostActions>
        <ActionButton onClick={handleLike}>
          👍 Like ({post.analytics.likes})
        </ActionButton>
        <ActionButton onClick={handleBookmark}>
          🔖 Bookmark
        </ActionButton>
        <ActionButton>
          🔗 Share
        </ActionButton>
      </PostActions>

      <CommentSection postId={post._id} />

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link 
          to="/blog" 
          style={{ 
            color: 'var(--primary-color)', 
            textDecoration: 'none',
            fontSize: '1.1rem'
          }}
        >
          ← Back to all posts
        </Link>
      </div>
    </PostContainer>
  );
};

// Helper function to format content (basic markdown to HTML)
const formatContent = (content) => {
  if (!content) return '';
  
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
};

export default Post;