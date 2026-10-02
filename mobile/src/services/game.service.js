import { api } from './api';

export const gameService = {
  async startGame() {
    const response = await api.post('/games/start');
    const created = response.data.data;
    const currentResponse = await api.get(`/games/${created.gameId}`);
    const current = currentResponse.data.data;
    return { ...current, game: { ...current.game, gameId: created.gameId } };
  },
  async getGame(gameId) {
    const response = await api.get(`/games/${gameId}`);
    return response.data.data;
  },
  async answerQuestion(gameId, selectedAnswer) {
    const response = await api.post(`/games/${gameId}/answer`, { selectedAnswer });
    return response.data.data;
  },
  async timeoutGame(gameId, expectedLevel) {
    const response = await api.post(`/games/${gameId}/timeout`, { expectedLevel });
    return response.data.data;
  },
  async stopGame(gameId) {
    const response = await api.post(`/games/${gameId}/stop`);
    return response.data.data;
  },
  async useLifeline(gameId, kind) {
    const response = await api.post(`/games/${gameId}/lifelines/${kind}`);
    return response.data.data;
  },
};
