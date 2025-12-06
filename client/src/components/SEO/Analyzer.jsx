import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  ContentCopy as ContentCopyIcon,
  Link as LinkIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  Speed as SpeedIcon,
  Smartphone as SmartphoneIcon,
  Language as LanguageIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Compare as CompareIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const SEOResultCard = ({ title, status, message, icon, details, severity = 'info' }) => {
  const severityColors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  };

  const icons = {
    success: <CheckCircleIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <Card sx={{ mb: 2, borderLeft: `4px solid ${severityColors[severity]}` }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Box mr={2} sx={{ color: severityColors[severity] }}>
            {icon || icons[severity]}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Chip
            label={status}
            size="small"
            sx={{ ml: 'auto', backgroundColor: severityColors[severity], color: 'white' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {details && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              {details}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const SEOAnalyzer = ({ url, pageData = null, onAnalyzeComplete, projectId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({
    basic: true,
    content: true,
    technical: true,
    recommendations: true,
    keywords: false,
    performance: false,
  });
  const [customUrl, setCustomUrl] = useState(url || '');
  const [tags, setTags] = useState([]);
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompetitorDialog, setShowCompetitorDialog] = useState(false);
  const [competitors, setCompetitors] = useState(['']);
  const [scheduledAnalysis, setScheduledAnalysis] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const isInitialMount = useRef(true);

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || '';
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Core analysis function - NOW CONNECTS TO REAL BACKEND
  const analyzeSEO = async (targetUrl = null, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const analyzeUrl = targetUrl || customUrl || window.location.href;
      
      // Validate URL
      if (!analyzeUrl.startsWith('http')) {
        setError('Please enter a valid URL starting with http:// or https://');
        setLoading(false);
        return;
      }

      // Call REAL backend API
      const response = await axios.post(`${API_BASE_URL}/api/seo/analyze`, {
        url: analyzeUrl,
        pageData,
        save: saveToHistory,
        projectId,
        tags: tags.length > 0 ? tags : undefined,
        force: forceRefresh,
      }, {
        headers: getAuthHeaders()
      });

      const analysisData = response.data;
      
      // If it's a cached result, show notification
      if (analysisData.cached) {
        enqueueSnackbar('Using cached analysis (from last 24 hours)', { variant: 'info' });
      } else {
        enqueueSnackbar('SEO analysis completed successfully!', { variant: 'success' });
      }

      setAnalysis(analysisData);
      
      if (onAnalyzeComplete) {
        onAnalyzeComplete(analysisData);
      }

      // Refresh history if saved
      if (saveToHistory) {
        fetchAnalysisHistory();
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze SEO';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      console.error('SEO Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analysis history
  const fetchAnalysisHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/seo/history`, {
        headers: getAuthHeaders(),
        params: { limit: 10 }
      });
      setAnalysisHistory(response.data.analyses);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  // Analyze competitors
  const analyzeCompetitors = async () => {
    try {
      setLoading(true);
      const validCompetitors = competitors.filter(c => c.trim() !== '');
      
      const response = await axios.post(`${API_BASE_URL}/api/seo/competitors`, {
        url: customUrl || window.location.href,
        competitors: validCompetitors
      }, {
        headers: getAuthHeaders()
      });

      enqueueSnackbar('Competitor analysis completed!', { variant: 'success' });
      // You could show competitor analysis in a new view
      console.log('Competitor analysis:', response.data);
      
      // Close dialog
      setShowCompetitorDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to analyze competitors';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Generate report
  const generateReport = async () => {
    if (!analysis || !analysis._id) return;
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/seo/reports/generate`, {
        analysisId: analysis._id,
        format: 'pdf'
      }, {
        headers: getAuthHeaders()
      });

      // Download the report
      window.open(`${API_BASE_URL}${response.data.downloadUrl}`, '_blank');
      enqueueSnackbar('Report generated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to generate report', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Schedule analysis
  const scheduleAnalysis = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/seo/schedule`, {
        url: customUrl || window.location.href,
        frequency: 'weekly', // daily, weekly, monthly
        projectId
      }, {
        headers: getAuthHeaders()
      });

      setScheduledAnalysis(true);
      enqueueSnackbar('Analysis scheduled successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to schedule analysis', { variant: 'error' });
    }
  };

  const handleExpand = (panel) => {
    setExpanded({ ...expanded, [panel]: !expanded[panel] });
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl) {
      analyzeSEO(customUrl);
    }
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, '']);
  };

  const removeCompetitor = (index) => {
    const newCompetitors = [...competitors];
    newCompetitors.splice(index, 1);
    setCompetitors(newCompetitors);
  };

  const updateCompetitor = (index, value) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Check if we should load a recent analysis
      const lastAnalysis = localStorage.getItem('lastSeoAnalysis');
      if (lastAnalysis) {
        try {
          setAnalysis(JSON.parse(lastAnalysis));
        } catch (e) {
          console.error('Failed to parse last analysis:', e);
        }
      }

      // Fetch history on mount
      fetchAnalysisHistory();

      if (url || pageData) {
        analyzeSEO();
      }
    }
  }, [url, pageData]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  if (loading && !analysis) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" flexDirection="column">
        <CircularProgress size={60} />
        <Typography variant="body1" mt={2}>
          Analyzing SEO... This may take a few moments.
        </Typography>
        <Typography variant="caption" color="text.secondary" mt={1}>
          Fetching page data, checking performance, and analyzing content...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* URL Input Form with Enhanced Options */}
      {!pageData && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Analyze URL
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<HistoryIcon />}
                onClick={() => setShowHistory(true)}
              >
                History
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CompareIcon />}
                onClick={() => setShowCompetitorDialog(true)}
              >
                Competitors
              </Button>
            </Box>
          </Box>
          
          <form onSubmit={handleUrlSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Enter URL to analyze"
                  variant="outlined"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SearchIcon />}
                  disabled={!customUrl || loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Tags</InputLabel>
                    <Select
                      multiple
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      label="Tags"
                      renderValue={(selected) => selected.join(', ')}
                    >
                      <MenuItem value="production">Production</MenuItem>
                      <MenuItem value="staging">Staging</MenuItem>
                      <MenuItem value="blog">Blog</MenuItem>
                      <MenuItem value="landing-page">Landing Page</MenuItem>
                      <MenuItem value="ecommerce">E-commerce</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={saveToHistory}
                        onChange={(e) => setSaveToHistory(e.target.checked)}
                      />
                    }
                    label="Save to history"
                  />
                  
                  <Tooltip title="Schedule weekly analysis">
                    <IconButton onClick={scheduleAnalysis} disabled={scheduledAnalysis}>
                      <ScheduleIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {analysis && (
        <>
          {/* Score Summary with Actions */}
          <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Grid container alignItems="center" spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      width: '100%',
                      maxWidth: 200,
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={analysis.score}
                      size={120}
                      thickness={4}
                      sx={{
                        color: getScoreColor(analysis.score),
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography variant="h4" component="div" color="text.primary">
                        {Math.round(analysis.score)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        /100
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        SEO Score
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {analysis.score >= 90
                          ? 'Excellent! Your page is well optimized for SEO.'
                          : analysis.score >= 70
                          ? 'Good, but there are some areas for improvement.'
                          : 'Needs significant improvement. Follow the recommendations below.'}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label={`${analysis.checks?.filter(c => c.severity === 'success').length || 0} Passed`}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          icon={<WarningIcon />}
                          label={`${analysis.checks?.filter(c => c.severity === 'warning').length || 0} Warnings`}
                          color="warning"
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          icon={<ErrorIcon />}
                          label={`${analysis.checks?.filter(c => c.severity === 'error').length || 0} Errors`}
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => analyzeSEO(null, true)}
                        disabled={loading}
                      >
                        Re-analyze
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={generateReport}
                        disabled={loading}
                      >
                        Export Report
                      </Button>
                    </Box>
                  </Box>
                  
                  {analysis.analyzedAt && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      Analyzed on {new Date(analysis.analyzedAt).toLocaleString()}
                      {analysis.cached && ' (Cached)'}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detailed Analysis Sections */}
          <Accordion expanded={expanded.basic} onChange={() => handleExpand('basic')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <TitleIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Basic SEO</Typography>
                <Chip
                  label={`${analysis.checks?.filter(c => c.category === 'basic').length || 0} checks`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {analysis.checks?.filter(c => c.category === 'basic').map((check, index) => (
                <SEOResultCard key={index} {...check} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.content} onChange={() => handleExpand('content')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <DescriptionIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Content Analysis</Typography>
                <Chip
                  label={`${analysis.checks?.filter(c => c.category === 'content').length || 0} checks`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {analysis.checks?.filter(c => c.category === 'content').map((check, index) => (
                <SEOResultCard key={index} {...check} />
              ))}
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.technical} onChange={() => handleExpand('technical')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center">
                <SpeedIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Technical SEO</Typography>
                <Chip
                  label={`${analysis.checks?.filter(c => c.category === 'technical').length || 0} checks`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {analysis.checks?.filter(c => c.category === 'technical').map((check, index) => (
                <SEOResultCard key={index} {...check} />
              ))}
            </AccordionDetails>
          </Accordion>

          {/* Performance Metrics */}
          {analysis.performance && (
            <Accordion expanded={expanded.performance} onChange={() => handleExpand('performance')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">Performance Metrics</Typography>
                  <Chip
                    label={`${analysis.performance.performanceScore ? 'Score: ' + Math.round(analysis.performance.performanceScore) : 'N/A'}`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {analysis.performance.fcp && (
                    <Grid item xs={6} sm={4} md={2}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {analysis.performance.fcp}ms
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            First Contentful Paint
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {analysis.performance.lcp && (
                    <Grid item xs={6} sm={4} md={2}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {analysis.performance.lcp}ms
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Largest Contentful Paint
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  {/* Add more metrics as needed */}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Keywords Section */}
          {analysis.keywords && analysis.keywords.length > 0 && (
            <Accordion expanded={expanded.keywords} onChange={() => handleExpand('keywords')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center">
                  <LanguageIcon sx={{ mr: 2 }} />
                  <Typography variant="h6">Keyword Analysis</Typography>
                  <Chip
                    label={`${analysis.keywords.length} keywords`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {analysis.keywords.slice(0, 10).map((keyword, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {keyword.keyword}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Density: {keyword.density.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Count: {keyword.count}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3} flexWrap="wrap" gap={2}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => analyzeSEO(null, true)}
                disabled={loading}
              >
                Force Re-analyze
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
                  enqueueSnackbar('Analysis copied to clipboard!', { variant: 'success' });
                }}
              >
                Copy Data
              </Button>
            </Box>
            
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={generateReport}
                disabled={loading}
              >
                Download Report
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={() => {
                  localStorage.setItem('lastSeoAnalysis', JSON.stringify(analysis));
                  enqueueSnackbar('Analysis saved locally!', { variant: 'success' });
                }}
              >
                Save Locally
              </Button>
            </Box>
          </Box>
        </>
      )}

      {!analysis && !loading && !error && !pageData && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Start SEO Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter a URL above to analyze its SEO performance and get actionable recommendations.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => {
              setCustomUrl(window.location.href);
              analyzeSEO(window.location.href);
            }}
          >
            Analyze Current Page
          </Button>
        </Paper>
      )}

      {/* History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon />
            Analysis History
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {analysisHistory.map((item, index) => (
              <React.Fragment key={item._id}>
                <ListItem 
                  button
                  onClick={() => {
                    setAnalysis(item);
                    setShowHistory(false);
                  }}
                >
                  <ListItemText
                    primary={item.url}
                    secondary={`Score: ${item.score} • ${new Date(item.analyzedAt).toLocaleDateString()}`}
                  />
                  <Chip 
                    label={item.score} 
                    size="small" 
                    sx={{ 
                      bgcolor: getScoreColor(item.score),
                      color: 'white'
                    }}
                  />
                </ListItem>
                {index < analysisHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {analysisHistory.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" py={4}>
                No analysis history yet. Start by analyzing a URL!
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Competitor Analysis Dialog */}
      <Dialog open={showCompetitorDialog} onClose={() => setShowCompetitorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CompareIcon />
            Competitor Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter competitor URLs to compare SEO performance:
          </Typography>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Target URL:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://your-site.com"
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Competitors:
          </Typography>
          
          {competitors.map((competitor, index) => (
            <Box key={index} display="flex" gap={1} mb={1}>
              <TextField
                fullWidth
                size="small"
                value={competitor}
                onChange={(e) => updateCompetitor(index, e.target.value)}
                placeholder={`https://competitor${index + 1}.com`}
              />
              {competitors.length > 1 && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeCompetitor(index)}
                >
                  Remove
                </Button>
              )}
            </Box>
          ))}
          
          <Button
            variant="outlined"
            size="small"
            onClick={addCompetitor}
            startIcon={<LinkIcon />}
            sx={{ mt: 1 }}
          >
            Add Competitor
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompetitorDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={analyzeCompetitors}
            disabled={loading || !customUrl}
          >
            {loading ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SEOAnalyzer;