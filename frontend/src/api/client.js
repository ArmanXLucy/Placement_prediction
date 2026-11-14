import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placement_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.details?.[0]?.message ||
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Is the backend running?'
        : error.message);

    error.message = message;

    const isAuthCall =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register');

    if (status === 401 && !isAuthCall) {
      localStorage.removeItem('placement_token');
      localStorage.removeItem('placement_user');
      window.dispatchEvent(new Event('placement:logout'));
    }

    return Promise.reject(error);
  }
);

export default api;
