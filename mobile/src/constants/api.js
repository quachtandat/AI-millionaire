// Android emulator default. Set EXPO_PUBLIC_API_BASE_URL to your backend's
// LAN URL when using a physical device (for example http://192.168.x.x:5555/api).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.2.15:5555/api';
export const API_TIMEOUT_MS = 15000;
