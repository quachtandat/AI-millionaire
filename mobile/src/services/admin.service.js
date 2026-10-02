import { api } from './api';

export const adminService = {
  async getCategories() {
    const response = await api.get('/categories');
    return response.data.data;
  },
  async getQuestions(page = 1, filters = {}) {
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
    const response = await api.get('/questions', { params: { ...activeFilters, page, limit: 50 } });
    return { questions: response.data.data, pagination: response.data.pagination };
  },
  async getQuestion(id) {
    const response = await api.get(`/questions/${id}`);
    return response.data.data;
  },
  async createCategory(category) {
    const response = await api.post('/categories', category);
    return response.data.data;
  },
  async createQuestion(question) {
    const response = await api.post('/questions', question);
    return response.data.data;
  },
  async updateQuestion({ id, ...question }) {
    const response = await api.put(`/questions/${id}`, question);
    return response.data.data;
  },
  async deleteQuestion(id) {
    await api.delete(`/questions/${id}`);
    return id;
  },
  async getAIDrafts() {
    const response = await api.get('/ai/questions/draft');
    return response.data.data;
  },
  async generateAIDrafts(payload) {
    const response = await api.post('/ai/questions/generate', payload);
    return response.data.data;
  },
  async reviewAIDraft({ id, action }) {
    const response = await api.post(`/ai/questions/${id}/${action}`);
    return response.data.data;
  },
};
