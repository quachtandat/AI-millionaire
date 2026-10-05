# Cài đặt thư viện dự án AI Millionaire

## Frontend mobile (Expo)

Nếu tạo project mới:

```bash
npx create-expo-app@latest mobile --template blank
cd mobile
```

### Thư viện đang dùng

- Expo / React Native: `expo`, `react`, `react-native`
- Điều hướng: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- Native dependencies: `react-native-screens`, `react-native-safe-area-context`
- Redux: `@reduxjs/toolkit`, `react-redux`
- API: `axios`
- Lưu phiên đăng nhập: `@react-native-async-storage/async-storage`
- Chọn avatar: `expo-image-picker`
- Thanh trạng thái Expo: `expo-status-bar`

### Cài thư viện thủ công

Chạy trong thư mục `mobile`. Các gói Expo/native nên cài bằng `expo install` để chọn phiên bản tương thích với Expo SDK hiện tại.

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install @reduxjs/toolkit react-redux axios
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage expo-image-picker expo-status-bar
```

`create-expo-app` đã cài Expo, React và React Native khi khởi tạo project.

## Backend (Node.js / Express)

Project hiện tại đã có `backend/package-lock.json`. Khi clone/cài lại:

```bash
cd backend
npm ci
```

### Thư viện đang dùng

- Server/API: `express`, `cors`, `dotenv`
- MySQL: `mysql2`
- Xác thực: `bcrypt`, `jsonwebtoken`
- Upload ảnh: `multer`, `@supabase/supabase-js`
- Tạo câu hỏi bằng AI: `@google/genai`
- Chạy lại server khi phát triển: `nodemon` (dev dependency)

### Cài thư viện thủ công

Chạy trong thư mục `backend`:

```bash
npm install express cors dotenv mysql2 bcrypt jsonwebtoken multer @supabase/supabase-js @google/genai
npm install --save-dev nodemon
```