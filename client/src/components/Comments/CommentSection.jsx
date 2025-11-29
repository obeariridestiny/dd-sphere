import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const CommentSectionContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: var(--surface-color);
  border-radius: 12px;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CommentTextarea = styled.textarea`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  min-height: 100px;
  resize: vertical;
`;

const CommentButton = styled.button`
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div`
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const CommentContent = styled.div`
  margin-bottom: 0.5rem;
`;

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/comments/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dd-sphere-token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <CommentSectionContainer>
      <h3>Comments ({comments.length})</h3>
      
      {user && (
        <CommentForm onSubmit={handleSubmit}>
          <CommentTextarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <CommentButton type="submit">Post Comment</CommentButton>
        </CommentForm>
      )}

      <CommentList>
        {comments.map(comment => (
          <CommentItem key={comment._id}>
            <CommentAuthor>{comment.author.username}</CommentAuthor>
            <CommentContent>{comment.content}</CommentContent>
            <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
          </CommentItem>
        ))}
      </CommentList>
    </CommentSectionContainer>
  );
};

export default CommentSection;