import { api } from './api';

export const learningService = {
  async getPerformance() {
    const [overall, categories, difficulties, responseTime] = await Promise.all([
      api.get('/games/statistics'), api.get('/games/statistics/categories'),
      api.get('/games/statistics/difficulties'), api.get('/games/statistics/response-times'),
    ]);
    return { overall: overall.data.data, categories: categories.data.data, difficulties: difficulties.data.data, responseTime: responseTime.data.data };
  },
  async getKnowledgeProfile() { const response = await api.get('/users/me/knowledge-profile'); return response.data.data; },
  async getRecommendations() { const response = await api.get('/users/me/recommendations'); return response.data.data; },
  async getAdminOverview() { const response = await api.get('/users/admin/overview'); return response.data.data; },
};
