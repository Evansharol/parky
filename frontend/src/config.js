/**
 * config.js – Centralized environment configuration
 */
const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  IMAGE_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
};

export default config;
