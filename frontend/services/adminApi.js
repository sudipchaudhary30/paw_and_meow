import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

adminApi.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Session-Fingerprint'] = window.navigator.userAgent;
  }

  // Double-Submit Cookie CSRF injection
  const method = config.method?.toLowerCase();
  const safeMethods = ['get', 'head', 'options'];
  if (!safeMethods.includes(method)) {
    let csrfToken = getCookie('csrf_token');
    if (!csrfToken) {
      try {
        const res = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
        csrfToken = res.data.csrfToken;
      } catch (err) {
        console.error('Failed to initialize CSRF token for admin:', err);
      }
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
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
  uploadImage: (formData) => adminApi.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default adminApi;
