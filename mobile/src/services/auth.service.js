import { api } from './api';

export const authService = {
  async register(credentials) {
    const response = await api.post('/auth/register', credentials);
    return response.data.data;
  },
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
};
