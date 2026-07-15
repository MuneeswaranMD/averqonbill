// Central API configuration
// Uses VITE_API_URL from .env (local dev) or .env.production (Render deploy)
// Local:      http://localhost:5000/api
// Production: https://averqonbill-1.onrender.com/api

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const WEBHOOK_BASE = API_BASE.replace('/api', '/api/webhook');

