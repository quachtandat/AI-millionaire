# AI Millionaire — React Native Frontend Implementation Plan

## 0. Mục đích của file này

File này là **master task plan cho Codex** để xây dựng Frontend React Native của dự án **AI Millionaire** và tích hợp với Backend REST API đã hoàn thành.

Mục tiêu cuối cùng:

```text
React Native Mobile App
        ↓
Redux Toolkit / Axios
        ↓
Node.js / Express REST API
        ↓
MySQL
```

Frontend phải trở thành một app hoàn chỉnh có thể:

- Đăng ký
- Đăng nhập bằng JWT
- Giữ phiên đăng nhập
- Vào Home
- Bắt đầu game
- Nhận câu hỏi từ backend
- Chọn đáp án
- Nhận kết quả đúng/sai từ backend
- Chuyển sang câu tiếp theo
- Sử dụng 50:50
- Sử dụng Hỏi khán giả
- Sử dụng Gọi điện thoại
- Dừng game
- Xem kết quả
- Xem lịch sử
- Xem ranking
- Xem profile
- Upload avatar nếu backend hỗ trợ endpoint tương ứng
- Xử lý loading/error/empty state
- Không để `correct_answer` xuất hiện trong dữ liệu question dành cho người chơi
- Không tự tính kết quả game ở frontend

---

# 1. Công nghệ bắt buộc

## Mobile

- React Native
- Expo
- JavaScript
- React Navigation
- Redux Toolkit
- Redux Thunk / `createAsyncThunk`
- Axios
- AsyncStorage

## Backend

Backend hiện tại:

- Node.js
- Express.js
- REST API
- JWT
- bcrypt
- MySQL
- Supabase cho avatar nếu endpoint hiện tại sử dụng Supabase

## Không sử dụng

- Expo Router
- TypeScript nếu project mobile đang dùng JavaScript
- Logic tính đáp án đúng ở frontend
- Hard-code dữ liệu game thay cho API thật khi đã có API

---

# 2. UI/UX Skill bắt buộc phải áp dụng

File UI/UX skill được cung cấp cùng task này là nguồn thiết kế chính.

Các nguyên tắc phải giữ:

- Mobile-first
- Thiết kế baseline khoảng 375px
- Visual hierarchy rõ ràng
- Primary action nằm trong thumb zone
- Spacing theo 8-point grid
- Tap target tối thiểu 44x44pt
- Tối đa khoảng 4 font sizes
- Tối đa 2 font weights
- Màu theo 60/30/10
- Dùng accent color có chủ đích
- Shadow mềm
- Có loading state
- Có error state
- Có empty state
- Có success state
- Có micro-animation ở những interaction quan trọng
- Không lạm dụng gradient/blur
- Không làm mọi thành phần có cùng visual weight
- Thiết kế peak moment cho lúc trả lời đúng / đạt mốc
- Thiết kế ending/result screen có cảm giác hoàn thành

Chi tiết UI/UX phải tham chiếu file `SKILL.md` được cung cấp.

---

# 3. Nguyên tắc kiến trúc Frontend

Kiến trúc:

```text
Screen
  ↓
Redux dispatch
  ↓
Slice / createAsyncThunk
  ↓
Service
  ↓
Axios
  ↓
Backend API
  ↓
MySQL
```

Không để Screen gọi API trực tiếp nếu API đó đã có service tương ứng.

Ví dụ:

```text
LoginScreen
    ↓
dispatch(loginUser(credentials))
    ↓
authSlice
    ↓
auth.service.js
    ↓
Axios
    ↓
POST /api/auth/login
```

---

# 4. Cấu trúc thư mục đề xuất

```text
mobile/
├── src/
│   ├── components/
│   │   ├── AppButton.js
│   │   ├── AppInput.js
│   │   ├── Loading.js
│   │   ├── ErrorMessage.js
│   │   ├── QuestionOption.js
│   │   ├── PrizeLadder.js
│   │   ├── LifelineButton.js
│   │   └── ...
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.js
│   │   │
│   │   ├── game/
│   │   │   ├── GameScreen.js
│   │   │   ├── ResultScreen.js
│   │   │   └── LifelineResultScreen.js
│   │   │
│   │   ├── history/
│   │   │   ├── HistoryScreen.js
│   │   │   └── GameDetailScreen.js
│   │   │
│   │   ├── ranking/
│   │   │   └── RankingScreen.js
│   │   │
│   │   └── profile/
│   │       └── ProfileScreen.js
│   │
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   │
│   ├── redux/
│   │   ├── store/
│   │   │   └── store.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── gameSlice.js
│   │       ├── historySlice.js
│   │       ├── rankingSlice.js
│   │       └── profileSlice.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   ├── game.service.js
│   │   ├── history.service.js
│   │   ├── ranking.service.js
│   │   └── profile.service.js
│   │
│   ├── constants/
│   │   ├── api.js
│   │   ├── colors.js
│   │   └── game.js
│   │
│   ├── utils/
│   │   ├── storage.js
│   │   ├── format.js
│   │   └── error.js
│   │
│   └── theme/
│       ├── colors.js
│       ├── spacing.js
│       ├── typography.js
│       └── theme.js
│
└── App.js
```

Codex có thể điều chỉnh tên file nếu project hiện tại đã có cấu trúc tương đương, nhưng không được tạo cấu trúc thứ hai song song.

---

# 5. PHASE 11 — Setup Mobile

## 11.1. Tạo project

Nếu chưa có mobile project:

```bash
npx create-expo-app mobile --template blank
```

Dùng JavaScript.

Nếu project đã tồn tại thì không tạo lại project.

---

## 11.2. Cài dependencies

Cài:

```bash
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs

npm install react-native-screens
npm install react-native-safe-area-context

npm install @reduxjs/toolkit
npm install react-redux

npm install axios
npm install @react-native-async-storage/async-storage
```

Với Expo, cài native dependencies bằng Expo khi cần:

```bash
npx expo install react-native-screens react-native-safe-area-context
```

---

# 6. PHASE 12 — API Configuration

## 12.1. Tạo Axios instance

File:

```text
src/services/api.js
```

Nhiệm vụ:

- Tạo Axios instance
- Có `baseURL`
- Có timeout hợp lý
- Tự động gắn JWT vào Authorization header

Ví dụ:

```text
Authorization: Bearer <JWT>
```

Không hard-code URL ở từng service.

---

## 12.2. API URL

Tạo:

```text
src/constants/api.js
```

Ví dụ:

```js
export const API_BASE_URL = "http://YOUR_BACKEND_IP:5555/api";
```

Khi test trên điện thoại thật:

- Không dùng `localhost`
- Dùng IP LAN của máy chạy backend

Khi deploy backend:

- Đổi sang URL backend production

Không rải URL backend khắp project.

---

# 7. PHASE 13 — Auth

## 13.1. auth.service.js

Implement:

```text
register()
login()
getProfile() / getCurrentUser() nếu backend có endpoint
```

API phải khớp chính xác với backend hiện tại.

Không tự đoán endpoint nếu endpoint đã tồn tại trong backend.

---

## 13.2. authSlice.js

State:

```js
{
    user: null,
    token: null,
    loading: false,
    initialized: false,
    error: null
}
```

Actions/thunks:

```text
registerUser
loginUser
restoreSession
logoutUser
```

---

## 13.3. JWT persistence

Sau login thành công:

```text
Backend
  ↓
JWT
  ↓
AsyncStorage
```

Redux giữ session runtime.

AsyncStorage giữ token để app có thể restore session sau khi restart.

Không lưu password vào AsyncStorage.

---

# 8. PHASE 14 — Navigation

Flow:

```text
App
 ↓
restoreSession
 ↓
 ├── chưa login → AuthNavigator
 │                  ├── Login
 │                  └── Register
 │
 └── đã login → MainNavigator
                    ├── Home
                    ├── History
                    ├── Ranking
                    └── Profile
```

Game navigation:

```text
Home
 ↓
GameScreen
 ↓
ResultScreen
```

Không cho user vào GameScreen nếu chưa có valid game session.

---

# 9. PHASE 15 — Home Screen

Home cần có:

- Greeting
- Username/avatar
- Nút "Chơi game"
- Điểm/thành tích nếu backend hỗ trợ
- Shortcut History
- Shortcut Ranking
- Shortcut Profile
- Logout

Primary CTA:

```text
CHƠI NGAY
```

Phải nằm trong vùng dễ bấm.

UI không được làm Home thành dashboard quá phức tạp.

---

# 10. PHASE 16 — Game API Integration

Đây là phần quan trọng nhất.

## 16.1. game.service.js

Implement các API tương ứng backend:

```text
startGame()
getGame()
getCurrentQuestion()
answerQuestion()
stopGame()
useFiftyFifty()
useAudience()
usePhone()
```

Tên function có thể thay đổi theo API backend thực tế.

---

# 11. PHASE 17 — gameSlice.js

State đề xuất:

```js
{
    game: null,
    currentQuestion: null,
    currentLevel: 1,
    currentPrize: 0,

    lifelines: {
        fifty_fifty: false,
        audience: false,
        phone: false
    },

    answerResult: null,

    loading: false,
    answering: false,
    lifelineLoading: false,

    error: null
}
```

Không lưu `correct_answer` trong state question để dùng cho UI.

Backend phải là nơi quyết định đúng/sai.

---

# 12. PHASE 18 — Start Game

Flow:

```text
Home
 ↓
POST /games/start
 ↓
Backend tạo game
 ↓
Backend chọn question
 ↓
Redux lưu game
 ↓
GameScreen
```

Nếu backend trả về game ID:

```text
gameId
```

thì dùng game ID đó cho toàn bộ session.

Không tự tạo game ID ở frontend.

---

# 13. PHASE 19 — GameScreen

GameScreen hiển thị:

```text
┌─────────────────────┐
│ Level 5             │
│ 200.000             │
│                     │
│ Question            │
│                     │
│ [ A. ... ]          │
│ [ B. ... ]          │
│ [ C. ... ]          │
│ [ D. ... ]          │
│                     │
│ 50:50  Audience     │
│ Phone        Stop   │
└─────────────────────┘
```

Không hiển thị:

```text
correct_answer
```

Không tự tính:

```text
isCorrect
```

Frontend chỉ gửi:

```json
{
    "selected_answer": "A"
}
```

Backend trả kết quả.

---

# 14. PHASE 20 — Answer Flow

Flow bắt buộc:

```text
User tap A
 ↓
Disable options
 ↓
POST /games/:id/answer
 ↓
Backend kiểm tra
 ↓
Redux nhận result
 ↓
Nếu đúng:
    show success feedback
    update level/prize
    load next question

Nếu sai:
    show wrong feedback
    chuyển ResultScreen
```

Không cho user spam nhiều answer request.

Trong lúc request:

```text
answering = true
```

Disable toàn bộ answer buttons.

---

# 15. PHASE 21 — Prize Ladder

Tạo component:

```text
PrizeLadder.js
```

Hiển thị 15 mức:

```text
15   1.000.000.000
14     100.000.000
13      50.000.000
...
1           10.000
```

Current level được highlight.

Không hard-code trạng thái current level trong component.

Lấy từ Redux/backend.

---

# 16. PHASE 22 — Lifelines

## 22.1. 50:50

Request:

```text
POST /games/:id/lifelines/fifty-fifty
```

Backend trả về các option bị loại.

Ví dụ:

```json
{
    "lifeline": "fifty_fifty",
    "removedOptions": ["B", "D"]
}
```

Frontend:

```text
B → disabled/hidden
D → disabled/hidden
```

Frontend không tự đoán hai đáp án sai.

---

## 22.2. Hỏi khán giả

Backend trả:

```json
{
    "A": 70,
    "B": 15,
    "C": 10,
    "D": 5
}
```

Frontend hiển thị dạng chart/bars.

Không tự tạo phần trăm nếu backend đã trả dữ liệu.

---

## 22.3. Gọi điện thoại

Backend trả gợi ý.

Frontend hiển thị:

```text
Người gọi:
"Theo tôi, đáp án có khả năng đúng là..."
```

Không tự tạo đáp án.

---

## 22.4. Lifeline state

Sau khi dùng:

```text
50:50 → disabled
Audience → disabled
Phone → disabled
```

State phải lấy từ backend/game state.

Không chỉ dựa vào UI state.

---

# 17. PHASE 23 — Stop Game

User bấm:

```text
DỪNG CHƠI
```

Hiển thị confirmation:

```text
Bạn có chắc muốn dừng cuộc chơi?
```

Nếu xác nhận:

```text
POST /games/:id/stop
 ↓
Backend cập nhật status
 ↓
Redux update
 ↓
ResultScreen
```

Không gọi stop hai lần.

---

# 18. PHASE 24 — Result Screen

Result cần hiển thị:

- Game status
- Level đạt được
- Prize
- Số câu trả lời đúng
- Tổng số câu đã chơi nếu backend cung cấp
- Nút chơi lại
- Nút xem lịch sử
- Nút về Home

Peak/end moment:

- Success animation khi thắng/đạt mốc
- Feedback rõ khi trả lời sai
- Summary card
- CTA quay lại game/Home hợp lý

Không dùng animation quá nặng.

---

# 19. PHASE 25 — History

## history.service.js

Implement API backend tương ứng:

```text
getGameHistory()
getGameDetail()
```

History screen:

```text
Game #15
Level 8
1.500.000
Completed
```

Có:

- Loading
- Empty state
- Error state
- Pull to refresh nếu phù hợp

Tap một item:

```text
HistoryScreen
 ↓
GameDetailScreen
```

---

# 20. PHASE 26 — Ranking

## ranking.service.js

Implement API ranking hiện tại.

Ranking Screen:

```text
1. User A    1.000.000.000
2. User B      100.000.000
3. User C       50.000.000
```

Nếu backend có pagination thì dùng pagination.

Không hard-code ranking.

Có loading/error/empty state.

---

# 21. PHASE 27 — Profile

## profile.service.js

Implement API:

```text
getProfile()
updateProfile()
uploadAvatar()
```

Nếu backend hiện tại đã có endpoint avatar:

```text
multipart/form-data
field: avatar
```

Frontend phải dùng:

```js
FormData
```

Không gửi image URL giả.

Profile hiển thị:

- Avatar
- Username
- Email
- Thông tin tài khoản
- Edit profile nếu backend hỗ trợ
- Logout

---

# 22. PHASE 28 — Global Error Handling

Axios cần xử lý:

```text
401
403
404
422
500
network error
timeout
```

Đặc biệt:

```text
401 Unauthorized
 ↓
token không hợp lệ/hết hạn
 ↓
clear token
 ↓
logout
 ↓
AuthNavigator
```

Không để app crash khi API lỗi.

---

# 23. PHASE 29 — Loading / Empty / Error

Mọi API screen phải có ít nhất:

```text
Loading
Success
Error
Empty
```

Ví dụ History:

```text
Loading:
ActivityIndicator

Empty:
"Bạn chưa có phiên chơi nào."
"Chơi game ngay"

Error:
"Không thể tải lịch sử."
"Thử lại"
```

---

# 24. PHASE 30 — UI Design System

Tạo:

```text
src/theme/colors.js
src/theme/spacing.js
src/theme/typography.js
src/theme/theme.js
```

## Spacing

Ưu tiên:

```text
4
8
12
16
24
32
48
64
```

## Typography

Không tạo quá nhiều font sizes.

Ví dụ:

```text
title
heading
body
caption
```

## Components

Reusable:

```text
AppButton
AppInput
AppCard
Loading
ErrorMessage
EmptyState
QuestionOption
LifelineButton
PrizeLadder
Avatar
```

Không copy/paste cùng một UI logic vào nhiều screen.

---

# 25. PHASE 31 — Game UX Polish

Sau khi API flow hoàn thành mới polish.

Thêm:

- Answer selected state
- Correct feedback
- Wrong feedback
- Question transition
- Prize transition
- Lifeline animation
- Button press feedback
- Result celebration

Không để animation làm chậm API flow.

---

# 26. PHASE 32 — Security checklist

Frontend:

- Không commit `.env`
- Không commit JWT
- Không log token
- Không log password
- Không chứa Gemini API key
- Không chứa database password
- Không chứa `correct_answer` trong UI question
- Không tự tính kết quả game
- Không tin `prize` do user gửi
- Không tin `level` do user gửi

Backend mới là source of truth.

---

# 27. PHASE 33 — API Contract Verification

Trước khi nối từng screen, Codex phải kiểm tra backend route hiện tại.

Không được tự tạo endpoint mới nếu endpoint tương ứng đã tồn tại.

Cần lập bảng:

| Feature | Method | Endpoint | Auth |
|---|---|---|---|
| Register | POST | `/api/auth/register` | No |
| Login | POST | `/api/auth/login` | No |
| Start Game | POST | `/api/games/start` | Yes |
| Get Game | GET | `/api/games/:id` | Yes |
| Answer | POST | `/api/games/:id/answer` | Yes |
| Stop | POST | `/api/games/:id/stop` | Yes |
| Lifeline 50:50 | POST | backend route hiện tại | Yes |
| Audience | POST | backend route hiện tại | Yes |
| Phone | POST | backend route hiện tại | Yes |
| History | GET | backend route hiện tại | Yes |
| Ranking | GET | backend route hiện tại | Yes |
| Profile | GET | backend route hiện tại | Yes |
| Avatar | POST | backend route hiện tại | Yes |

**Quan trọng:** Nếu route thực tế trong backend khác bảng trên, phải dùng route thực tế của backend. Không sửa backend chỉ để khớp bảng này nếu không cần thiết.

---

# 28. PHASE 34 — Integration Test

Test theo đúng flow:

## Test A — Authentication

```text
Register
 ↓
Login
 ↓
App restart
 ↓
JWT restored
 ↓
Home
```

## Test B — Game

```text
Home
 ↓
Start
 ↓
Question 1
 ↓
Answer correct
 ↓
Question 2
 ↓
...
```

## Test C — Wrong answer

```text
Question
 ↓
Wrong
 ↓
Game ends
 ↓
Result
 ↓
History
```

## Test D — Lifelines

```text
50:50
Audience
Phone
```

Mỗi loại chỉ sử dụng được một lần/game.

## Test E — Stop

```text
Game
 ↓
Stop
 ↓
Result
 ↓
History
```

## Test F — Profile

```text
Profile
 ↓
Load profile
 ↓
Upload avatar
 ↓
Refresh
 ↓
Avatar vẫn hiển thị
```

---

# 29. PHASE 35 — Offline / Network Failure

Không cần xây offline game.

Nhưng phải xử lý:

```text
No internet
 ↓
API request fail
 ↓
Thông báo rõ
 ↓
Retry
```

Đặc biệt không làm app nghĩ rằng answer đã đúng nếu request thất bại.

---

# 30. PHASE 36 — Android Testing

Test:

- Android emulator
- Android physical device

Kiểm tra:

- API URL
- JWT
- image upload
- keyboard
- safe area
- screen size
- back button
- loading
- network failure

---

# 31. PHASE 37 — Build APK

Sau khi integration test hoàn thành:

```text
npx expo start
```

Sau đó cấu hình Expo/EAS để build Android.

Không build APK trước khi game flow chạy ổn trên development.

---

# 32. Definition of Done

Frontend được xem là hoàn thành khi:

- [ ] Register hoạt động
- [ ] Login hoạt động
- [ ] JWT được lưu bằng AsyncStorage
- [ ] App restore session
- [ ] Logout hoạt động
- [ ] Navigation auth/main đúng
- [ ] Home hoạt động
- [ ] Start game hoạt động
- [ ] Question lấy từ backend
- [ ] Answer gửi backend
- [ ] Backend quyết định đúng/sai
- [ ] Next question hoạt động
- [ ] Prize/level cập nhật đúng
- [ ] 50:50 hoạt động
- [ ] Audience hoạt động
- [ ] Phone hoạt động
- [ ] Stop game hoạt động
- [ ] Result hoạt động
- [ ] History hoạt động
- [ ] Game detail hoạt động
- [ ] Ranking hoạt động
- [ ] Profile hoạt động
- [ ] Avatar upload hoạt động nếu endpoint backend đã sẵn sàng
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] JWT 401 handling
- [ ] Không expose correct_answer
- [ ] Không expose AI API key
- [ ] Không hard-code game result
- [ ] Android test hoàn chỉnh
- [ ] UI/UX tuân thủ `SKILL.md`

---

# 33. Cách Codex phải thực hiện

Không triển khai toàn bộ frontend trong một lần.

Thực hiện theo thứ tự:

```text
1. Inspect existing project
2. Inspect backend routes/controllers/services
3. Inspect existing mobile files
4. Create/adjust architecture
5. Setup Axios
6. Setup Redux
7. Setup Auth
8. Setup Navigation
9. Build Home
10. Build Game
11. Build Answer
12. Build Lifelines
13. Build Stop/Result
14. Build History
15. Build Ranking
16. Build Profile
17. Error/loading/empty states
18. UI polish
19. Integration testing
20. Android build
```

Sau mỗi phase:

1. Chạy app.
2. Kiểm tra lỗi.
3. Test API integration.
4. Chỉ chuyển phase tiếp theo khi phase hiện tại hoạt động.

---

# 34. Quy tắc quan trọng cho Codex

### Không phá backend đang hoạt động

Backend đã được xây dựng và test.

Chỉ sửa backend nếu:

- API contract thực sự thiếu;
- API trả dữ liệu không đủ cho frontend;
- Có bug được xác định rõ.

### Không tạo mock data thay cho API thật

Mock data chỉ được dùng tạm thời cho UI development và phải được loại bỏ trước integration test.

### Không tạo duplicate architecture

Nếu project đã có:

```text
services/
redux/
navigation/
screens/
```

thì mở rộng cấu trúc hiện tại thay vì tạo:

```text
api/
store2/
services2/
navigation2/
```

### Không tự ý đổi stack

Giữ:

```text
React Native
Expo
JavaScript
React Navigation
Redux Toolkit
Axios
AsyncStorage
```

### Không tự ý thêm Expo Router

Project này dùng React Navigation.

### Backend là source of truth

Đặc biệt đối với:

```text
correct answer
game status
current level
prize
lifeline usage
game result
ranking
```

Frontend chỉ hiển thị và gửi user action.

---

# 35. Thứ tự triển khai thực tế đầu tiên

Khi bắt đầu với Codex, hãy làm đúng 5 bước đầu:

```text
STEP 1
Inspect mobile project

STEP 2
Inspect backend API routes

STEP 3
Create API service + Axios

STEP 4
Create Redux store + authSlice

STEP 5
Implement Login → JWT → Home
```

Sau khi 5 bước này chạy ổn mới tiếp tục:

```text
Home
 ↓
Start Game
 ↓
GameScreen
 ↓
Answer
 ↓
Lifelines
 ↓
Result
```

Đây là **MVP vertical slice** của app và phải được ưu tiên trước History/Ranking/Profile.

---

# 36. Expected final architecture

```text
                    ┌─────────────────────┐
                    │   React Native App  │
                    └──────────┬──────────┘
                               │
                        React Navigation
                               │
              ┌────────────────┴────────────────┐
              │                                 │
           Screens                         Components
              │
              ↓
         Redux Toolkit
              │
       createAsyncThunk
              │
              ↓
           Services
              │
            Axios
              │
              ↓
      Node.js / Express API
              │
       ┌──────┴───────┐
       │              │
     MySQL         Supabase
       │              │
   game/users/     avatar
   questions/
   history/
   ranking/
```

## Final UX flow

```text
OPEN APP
   ↓
Restore JWT
   ↓
LOGIN / REGISTER
   ↓
HOME
   ↓
┌─────────────────────────┐
│       CHƠI NGAY         │
└────────────┬────────────┘
             ↓
         START GAME
             ↓
       QUESTION SCREEN
             ↓
      ┌──────┴──────┐
      │             │
   Lifeline       Answer
      │             │
      │       ┌─────┴─────┐
      │       │           │
      │     Correct      Wrong
      │       │           │
      │   Next Question   │
      │       │           │
      └───────┴───────────┘
              ↓
           RESULT
              ↓
       ┌──────┼──────┐
       ↓      ↓      ↓
    HOME   HISTORY  RANKING

PROFILE có thể truy cập từ Main Navigation.
```

---

# 37. Mục tiêu cuối cùng

Không chỉ tạo một bộ screen đẹp.

Mục tiêu là:

```text
REAL MOBILE APP
       +
REAL BACKEND
       +
REAL DATABASE
       +
REAL AUTH
       +
REAL GAME SESSION
       +
REAL LIFELINES
       +
REAL HISTORY
       +
REAL RANKING
       +
POLISHED UI/UX
```

Frontend phải là client thực sự của backend hiện tại, không phải một prototype độc lập.
