import api from './api'

export const authAPI = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
}

export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
}

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: { product_id: number; quantity: number }) => api.post('/cart/add', data),
  update: (itemId: number, quantity: number) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId: number) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
}

export const orderAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
}

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (data: { product_id: number }) => api.post('/wishlist/add', data),
  remove: (productId: number) => api.delete(`/wishlist/remove/${productId}`),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params?: any) => api.get('/admin/analytics', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
}
