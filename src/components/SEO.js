import React from 'react';
import { useLocation } from 'react-router-dom';

function SEO() {
  const location = useLocation();

  // Get page-specific SEO data
  const getPageSEO = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/submit':
      case '/':
        return {
          title: 'Submit Daily Activity | Daily Activity Tracker',
          description: 'Submit your daily outreach activities including DMs sent, comments made, replies received, follow-ups, and calls booked.',
          keywords: 'daily activity submission, outreach tracking, activity form, business productivity',
          ogTitle: 'Submit Daily Activity - Track Your Outreach',
          ogDescription: 'Submit your daily outreach activities and track your progress with our easy-to-use form.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-submit.png'
        };
      
      case '/admin':
        return {
          title: 'Admin Dashboard | Daily Activity Analytics',
          description: 'Comprehensive analytics dashboard with real-time charts, data export, and performance insights for your outreach activities.',
          keywords: 'admin dashboard, analytics, charts, data export, business insights, performance tracking',
          ogTitle: 'Admin Dashboard - Analytics & Insights',
          ogDescription: 'View comprehensive analytics, charts, and insights for your daily outreach activities.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-dashboard.png'
        };
      
      case '/realtime':
        return {
          title: 'Real-time Analytics | Live Activity Dashboard',
          description: 'Real-time analytics dashboard with live updates, trend charts, and Looker Studio integration for advanced insights.',
          keywords: 'real-time analytics, live dashboard, trend analysis, Looker Studio, live updates',
          ogTitle: 'Real-time Analytics - Live Dashboard',
          ogDescription: 'Monitor your activities in real-time with live updates and trend analysis.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-realtime.png'
        };
      
      case '/login':
        return {
          title: 'Admin Login | Daily Activity Tracker',
          description: 'Secure admin login for accessing analytics dashboard and activity management features.',
          keywords: 'admin login, secure access, dashboard login, authentication',
          ogTitle: 'Admin Login - Secure Access',
          ogDescription: 'Secure login for accessing the analytics dashboard and management features.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-login.png'
        };
      
      case '/test':
        return {
          title: 'Database Connection Test | Daily Activity Tracker',
          description: 'Test database connectivity and verify Supabase integration for the Daily Activity Tracker application.',
          keywords: 'database test, connection test, Supabase integration, system health',
          ogTitle: 'Database Connection Test',
          ogDescription: 'Test and verify database connectivity and system health.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-test.png'
        };
      
      default:
        return {
          title: 'Daily Activity Tracker & Analytics Dashboard',
          description: 'Track daily outreach activities including DMs sent, comments made, replies received, follow-ups, and calls booked. Real-time analytics dashboard with charts and insights.',
          keywords: 'daily activity tracker, outreach analytics, sales tracking, activity dashboard, productivity tools',
          ogTitle: 'Daily Activity Tracker & Analytics Dashboard',
          ogDescription: 'Track your daily outreach activities with real-time analytics. Monitor DMs, comments, replies, follow-ups, and calls with beautiful charts and insights.',
          ogImage: 'https://c-web-daily-activity-tracker.vercel.app/og-image.png'
        };
    }
  };

  const seoData = getPageSEO();

  // Update meta tags dynamically
  React.useEffect(() => {
    // Update document title
    document.title = seoData.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoData.description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seoData.keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seoData.ogTitle);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seoData.ogDescription);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute('content', seoData.ogImage);
    }
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seoData.ogTitle);
    }
    
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seoData.ogDescription);
    }
    
    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', seoData.ogImage);
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://c-web-daily-activity-tracker.vercel.app${location.pathname}`);
    }
    
    // Update og:url
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://c-web-daily-activity-tracker.vercel.app${location.pathname}`);
    }
    
    // Update Twitter URL
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', `https://c-web-daily-activity-tracker.vercel.app${location.pathname}`);
    }
  }, [location.pathname, seoData]);

  return null; // This component doesn't render anything
}

export default SEO; 