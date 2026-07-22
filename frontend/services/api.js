import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send HttpOnly cookies to the API
});

// Helper to get cookie value by name
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Attach token and handle CSRF on every request
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Session-Fingerprint'] = window.navigator.userAgent;
  }

  // Double-Submit Cookie CSRF injection
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];
  if (!safeMethods.includes(method)) {
    let csrfToken = getCookie('csrf_token');

    // If the cookie is missing, fetch a new one synchronously
    if (!csrfToken) {
      try {
        const res = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
        csrfToken = res.data.csrfToken;
      } catch (err) {
        console.error('Failed to initialize CSRF token:', err);
      }
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  requestPasswordless: (data) => api.post('/auth/passwordless/request', data),
  passwordlessLogin: (data) => api.post('/auth/passwordless/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  exportProfile: () => api.get('/auth/export'),
  getCaptcha: () => api.get('/auth/captcha'),
};

// Pets
export const petAPI = {
  getAll: (params) => api.get('/pets', { params }),
  getOne: (id) => api.get(`/pets/${id}`),
  create: (data) => api.post('/pets', data),
  getStats: () => api.get('/pets/stats'),
};

// Blogs
export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getOne: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
};

// Visits
export const visitAPI = {
  request: (data) => api.post('/visits', data),
  getMy: () => api.get('/visits/my'),
  cancel: (id) => api.put(`/visits/${id}/cancel`),
};

// Orders
export const orderAPI = {
  place: (data) => api.post('/orders', data),
  verifyEsewa: (data) => api.post('/orders/esewa/verify', data),
  getMy: () => api.get('/orders/my'),
};

// Image Upload
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload', formData),
};

export default api;
