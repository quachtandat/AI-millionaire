import { api } from './api';

export const gameService = {
  async startGame() {
    const response = await api.post('/games/start');
    const created = response.data.data;
    const currentResponse = await api.get(`/games/${created.gameId}`);
    const current = currentResponse.data.data;
    return { ...current, game: { ...current.game, gameId: created.gameId } };
  },
  async startSmartQuiz(categoryId) {
    const response = await api.post('/games/smart-quiz/start', categoryId ? { categoryId } : {});
    const created = response.data.data;
    const current = await api.get(`/games/${created.gameId}`);
    return { ...current.data.data, game: { ...current.data.data.game, ...created, gameId: created.gameId, game_mode: 'practice' } };
  },
  async getGame(gameId) {
    const response = await api.get(`/games/${gameId}`);
    return response.data.data;
  },
  async answerQuestion(gameId, selectedAnswer, expectedLevel) {
    const response = await api.post(`/games/${gameId}/answer`, { selectedAnswer, expectedLevel });
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
