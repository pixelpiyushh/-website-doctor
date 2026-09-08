/**
 * API Configuration for Website Doctor
 * Supports optional VITE_API_BASE_URL environment variable for separate frontend/backend deployments
 * (e.g. Frontend on Vercel and Backend on Render/Railway)
 */
export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}
