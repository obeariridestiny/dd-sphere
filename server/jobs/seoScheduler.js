const cron = require('node-cron');
const axios = require('axios');
const SEOAnalysis = require('../models/seoAnalysis.model');

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled SEO analysis...');

  // Find analyses scheduled for daily check
  const scheduledAnalyses = await SEOAnalysis.find({
    scheduled: true,
    'schedule.frequency': 'daily'
  });

  for (const analysis of scheduledAnalyses) {
    try {
      // Re-analyze each URL
      const response = await axios.post('http://localhost:5000/api/seo/analyze', {
        url: analysis.url,
        save: true,
        force: true
      });

      console.log(`Analyzed ${analysis.url}: ${response.data.score}`);
    } catch (error) {
      console.error(`Failed to analyze ${analysis.url}:`, error.message);
    }
  }
});