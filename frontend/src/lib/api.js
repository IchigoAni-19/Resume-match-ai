import axios from "axios";

/**
 * Shared Axios instance used by all API service modules.
 *
 * Base URL logic:
 * - Development (`npm run dev`): empty string → Vite proxy forwards /api/* to localhost:3000
 * - Production (Vercel): VITE_API_URL env var → full Render backend URL (e.g. https://resume-match-ai.onrender.com)
 *
 * Set VITE_API_URL in your Vercel project environment variables:
 *   VITE_API_URL=https://your-backend.onrender.com
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "",
    withCredentials: true,
});

export default api;
