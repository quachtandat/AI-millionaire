import { api } from './api';

export const historyService = {
  async getGameHistory() { const response = await api.get('/games/history'); return response.data.data; },
  async getGameDetail(gameId) { const response = await api.get(`/games/${gameId}/detail`); return response.data.data; },
};
