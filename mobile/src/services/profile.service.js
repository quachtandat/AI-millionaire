import { api } from './api';

export const profileService = {
  async getProfile() { const response = await api.get('/users/profile'); return response.data.data; },
  async updateProfile(profile) { const response = await api.put('/users/profile', profile); return response.data.data; },
  async uploadAvatar(file) {
    const form = new FormData();
    form.append('avatar', { uri: file.uri, name: file.name || 'avatar.jpg', type: file.type || 'image/jpeg' });
    const response = await api.post('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data;
  },
};
