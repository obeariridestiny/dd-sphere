import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../api/posts';
import SEOAnalyzer from '../components/SEO/Analyzer.jsx';

const EditorContainer = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 2rem;
`;

const EditorForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-color);
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: var(--primary-color);
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const SecondaryButton = styled(Button)`
  background: var(--surface-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);

  &:hover:not(:disabled) {
    background: var(--border-color);
  }
`;

const Editor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Technology',
    tags: '',
    featuredImage: { url: '', alt: '' },
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: ''
    },
    status: 'draft'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else if (name.startsWith('featuredImage.')) {
      const imageField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          ...prev.featuredImage,
          [imageField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo: {
        ...prev.seo,
        metaTitle: title.length > 0 ? `${title} | DD Sphere` : ''
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        readingTime: Math.ceil(formData.content.split(' ').length / 200) || 1
      };

      await postsAPI.createPost(postData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Save as draft logic
    console.log('Saving as draft:', formData);
  };

  if (!user || !['author', 'admin'].includes(user.role)) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Access Denied</h2>
        <p>You need author privileges to access the editor.</p>
      </div>
    );
  }

  return (
    <EditorContainer>
      <h1>Create New Post</h1>
      
      <EditorForm onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title *</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter post title..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="post-url-slug"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="excerpt">Excerpt *</Label>
          <TextArea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description of your post..."
            required
            maxLength={300}
          />
          <small>{formData.excerpt.length}/300 characters</small>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="content">Content *</Label>
          <TextArea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your post content here... (Markdown supported)"
            required
            rows={15}
          />
        </FormGroup>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormGroup>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Technology">Technology</option>
              <option value="Programming">Programming</option>
              <option value="Web Development">Web Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="DevOps">DevOps</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tags">Tags</Label>
            <Input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, javascript, webdev"
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="featuredImage.url">Featured Image URL</Label>
          <Input
            type="url"
            id="featuredImage.url"
            name="featuredImage.url"
            value={formData.featuredImage.url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="featuredImage.alt">Image Alt Text</Label>
          <Input
            type="text"
            id="featuredImage.alt"
            name="featuredImage.alt"
            value={formData.featuredImage.alt}
            onChange={handleChange}
            placeholder="Description of the image"
          />
        </FormGroup>

        <h3>SEO Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormGroup>
            <Label htmlFor="seo.metaTitle">Meta Title</Label>
            <Input
              type="text"
              id="seo.metaTitle"
              name="seo.metaTitle"
              value={formData.seo.metaTitle}
              onChange={handleChange}
              placeholder="SEO optimized title"
              maxLength={60}
            />
            <small>{formData.seo.metaTitle.length}/60 characters</small>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="seo.focusKeyword">Focus Keyword</Label>
            <Input
              type="text"
              id="seo.focusKeyword"
              name="seo.focusKeyword"
              value={formData.seo.focusKeyword}
              onChange={handleChange}
              placeholder="main keyword"
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="seo.metaDescription">Meta Description</Label>
          <TextArea
            id="seo.metaDescription"
            name="seo.metaDescription"
            value={formData.seo.metaDescription}
            onChange={handleChange}
            placeholder="SEO optimized description"
            maxLength={160}
            rows={3}
          />
          <small>{formData.seo.metaDescription.length}/160 characters</small>
        </FormGroup>

        {/* SEO Analyzer Component */}
        <SEOAnalyzer
          content={formData.content}
          title={formData.title}
          metaDescription={formData.seo.metaDescription}
          focusKeyword={formData.seo.focusKeyword}
        />

        <ButtonGroup>
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={handleSaveDraft}>
            Save Draft
          </SecondaryButton>
        </ButtonGroup>
      </EditorForm>
    </EditorContainer>
  );
};

export default Editor;