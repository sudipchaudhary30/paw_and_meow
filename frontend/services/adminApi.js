import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export const adminAuthAPI = {
  login: (data) => adminApi.post('/auth/login', data),
  getMe: () => adminApi.get('/auth/me'),
};

export const adminPetAPI = {
  getAll: (params) => adminApi.get('/pets', { params }),
  getOne: (id) => adminApi.get('/pets/' + id),
  create: (data) => adminApi.post('/pets', data),
  update: (id, data) => adminApi.put('/pets/' + id, data),
  delete: (id) => adminApi.delete('/pets/' + id),
};

export const adminProductAPI = {
  getAll: (params) => adminApi.get('/products', { params }),
  create: (data) => adminApi.post('/products', data),
  update: (id, data) => adminApi.put('/products/' + id, data),
  delete: (id) => adminApi.delete('/products/' + id),
};

export const adminVisitAPI = {
  getAll: (params) => adminApi.get('/visits', { params }),
  update: (id, data) => adminApi.put('/visits/' + id, data),
};

export const adminOrderAPI = {
  getAll: (params) => adminApi.get('/orders', { params }),
  update: (id, data) => adminApi.put('/orders/' + id, data),
};

export const adminBlogAPI = {
  getAll: (params) => adminApi.get('/blogs', { params }),
  create: (data) => adminApi.post('/blogs', data),
  update: (id, data) => adminApi.put('/blogs/' + id, data),
  delete: (id) => adminApi.delete('/blogs/' + id),
  approve: (id) => adminApi.put('/blogs/' + id + '/approve'),
};

export const adminUploadAPI = {
  uploadImage: (formData) => adminApi.post('/upload', formData),
};

export default adminApi;
