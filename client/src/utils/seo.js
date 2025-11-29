// SEO helper functions
export const updateMetaTags = (title, description, keywords = '') => {
  // Update title
  if (title) {
    document.title = `${title} | DD Sphere`;
  }

  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    document.head.appendChild(metaDescription);
  }
  metaDescription.content = description || 'Premium tech blogging platform';

  // Update meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = keywords;
  }

  // Update Open Graph tags
  updateOpenGraph(title, description);
};

const updateOpenGraph = (title, description) => {
  // OG Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = title ? `${title} | DD Sphere` : 'DD Sphere';

  // OG Description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescription);
  }
  ogDescription.content = description || 'Premium tech blogging platform';

  // OG URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = window.location.href;
};

// Generate structured data for posts
export const generatePostStructuredData = (post) => {
  if (!post) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage?.url || '',
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.username || 'DD Sphere Author'
    },
    publisher: {
      '@type': 'Organization',
      name: 'DD Sphere',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${window.location.origin}/blog/${post.slug}`
    }
  };
};

// Add structured data to page
export const addStructuredData = (data) => {
  if (!data) return;

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Update canonical URL
export const updateCanonicalUrl = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
};