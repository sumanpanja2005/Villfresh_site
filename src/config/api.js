// API URL configuration
// In production (same origin), use relative path
// In development, use full URL
const API_URL = 
  import.meta.env.PROD 
    ? '/api'  // Production: relative path (same origin)
    : import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Development: full URL

export default API_URL;

