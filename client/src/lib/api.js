import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
// VITE_API_URL incluye el sufijo /api (ej. http://localhost:4000/api), pero /health
// vive en la raiz del servidor, asi que se la quitamos para construir esa URL.
const SERVER_ROOT = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function checkHealth() {
  const { data } = await axios.get(`${SERVER_ROOT}/health`);
  return data;
}

export default api;
