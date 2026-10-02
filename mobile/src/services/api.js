import { create } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api';
import { storage } from '../utils/storage';

export const api = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

let unauthorizedHandler;
export const setUnauthorizedHandler = (handler) => { unauthorizedHandler = handler; };

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export function getApiError(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'Kết nối quá thời gian. Vui lòng thử lại.';
  if (!error.response) return 'Không thể kết nối máy chủ. Hãy kiểm tra mạng và địa chỉ API.';
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
