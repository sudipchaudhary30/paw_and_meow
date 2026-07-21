import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
  getMy: () => api.get('/orders/my'),
};

// Image Upload
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload', formData),
};

export default api;
