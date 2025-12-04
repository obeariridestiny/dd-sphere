import { useState, useCallback } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const useSEOAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const analyze = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/seo/analyze', {
        url,
        ...options
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      enqueueSnackbar('SEO analysis completed!', { variant: 'success' });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to analyze SEO';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const batchAnalyze = useCallback(async (urls, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/seo/analyze/batch', {
        urls,
        ...options
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      enqueueSnackbar(`Analyzed ${response.data.success} URLs`, { variant: 'success' });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Batch analysis failed';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const getHistory = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/seo/history', {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to fetch history';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const trackKeywords = useCallback(async (keywords, url, competitors = []) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/seo/keywords/track', {
        keywords,
        url,
        competitors
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      enqueueSnackbar('Keyword tracking started!', { variant: 'success' });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to track keywords';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const analyzeCompetitors = useCallback(async (url, competitors) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/seo/competitors', {
        url,
        competitors
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      enqueueSnackbar('Competitor analysis completed!', { variant: 'success' });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to analyze competitors';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  const generateReport = useCallback(async (analysisId, format = 'html') => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/seo/reports/generate', {
        analysisId,
        format
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      enqueueSnackbar('Report generated successfully!', { variant: 'success' });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to generate report';
      setError(message);
      enqueueSnackbar(message, { variant: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  return {
    loading,
    error,
    analyze,
    batchAnalyze,
    getHistory,
    trackKeywords,
    analyzeCompetitors,
    generateReport
  };
};

export default useSEOAnalyzer;