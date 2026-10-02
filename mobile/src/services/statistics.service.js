import { api } from './api';

export const statisticsService = {
  async getStatistics() { const response = await api.get('/games/statistics'); return response.data.data; },
};
