// Environment-aware API configuration
// Uses localhost in development, relative URLs in production (Vercel)
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? '' // Use relative URLs on Vercel
  : 'http://localhost:3001'; // Use localhost in development

export { API_BASE_URL };
