import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT ──────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexerp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexerp_token');
      localStorage.removeItem('nexerp_user');
      // Dispatch event so AuthContext can react
      window.dispatchEvent(new CustomEvent('nexerp:session-expired'));
    }
    return Promise.reject(error);
  }
);

// Helper: extract a user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.message === 'Network Error') return 'Unable to reach the server. Please check your connection.';
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    return error.message || 'An unexpected error occurred.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export default apiClient;
