import { api } from './api';

export const rankingService = {
  async getRanking(limit = 20) { const response = await api.get('/games/ranking', { params: { limit } }); return response.data.data; },
};
