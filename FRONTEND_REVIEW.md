# Frontend Review — AI Millionaire

## 1. Phạm vi

Các file đã đọc:
- mobile/src/services/api.js
- mobile/src/services/game.service.js
- mobile/src/redux/slices/gameSlice.js
- mobile/src/redux/slices/authSlice.js
- mobile/src/screens/game/GameScreen.js
- mobile/package.json

Chưa review toàn bộ màn hình, component, navigation và các service còn lại.

## 2. Kiến trúc quan sát được

Mobile sử dụng React Native/Expo, React Navigation, Redux Toolkit, Axios và AsyncStorage. API được tách khỏi màn hình; Redux thunk gọi service và chuyển lỗi qua getApiError. Đây là hướng tổ chức hợp lý, giúp màn hình không phải trực tiếp viết request HTTP.

## 3. Điểm làm tốt

- Axios instance tập trung baseURL, timeout và header mặc định.
- Request interceptor tự đính kèm Bearer token.
- Response interceptor xử lý 401 và gọi unauthorizedHandler tập trung.
- getApiError chuẩn hóa lỗi mạng, timeout và lỗi API.
- Redux Toolkit createAsyncThunk tách pending/fulfilled/rejected.
- Game slice có trạng thái riêng cho answering, timingOut, lifelineLoading.
- toSafeQuestion chuyển response backend thành model dùng trong UI, tránh đưa toàn bộ payload trực tiếp vào component.
- GameScreen cleanup interval khi effect kết thúc; timer retry timeout có khoảng chờ 5 giây sau lỗi.

## 4. Findings

### FE-GAME-001 — Timer chưa đồng bộ với thời gian bắt đầu câu hỏi phía server
- **File:** mobile/src/screens/game/GameScreen.js, effect phụ thuộc currentQuestion?.id.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed.
- **Mô tả:** Client khởi tạo questionStartedAt = Date.now() khi effect chạy và đếm 60 giây. Backend lưu question_started_at trong game_questions và dùng timestamp DB để tính response_time_seconds. Nếu app bị background, remount hoặc tải lại, client có thể bắt đầu lại 60 giây dù server đã tính thời gian từ trước.
- **Nguyên nhân:** Mốc thời gian UI được tạo độc lập trên client, chưa lấy timestamp server.
- **Hướng giải quyết:** API trả expiresAt/questionStartedAt; client tính remaining = expiresAt - Date.now(); backend vẫn là nguồn quyết định timeout. Xử lý trường hợp lệch múi giờ bằng timestamp ISO/epoch thống nhất.
- **Kiểm thử sau sửa:** Background 20 giây rồi quay lại; remount màn hình; app khởi động lại khi game đang chơi; trả lời sát deadline; gửi timeout trễ.

### FE-GAME-002 — Có thể dispatch nhiều request answer nếu UI không khóa ngay lập tức
- **File:** mobile/src/screens/game/GameScreen.js, hàm answer; mobile/src/redux/slices/gameSlice.js.
- **Mức độ:** Medium.
- **Trạng thái:** Needs verification.
- **Mô tả:** UI truyền disabled={busy} cho QuestionOption; busy dựa trên answering/timingOut/lifelineLoading/timeRemaining. Cần kiểm tra component QuestionOption có chặn press đồng bộ và Redux thunk có điều kiện condition chống dispatch lặp hay không.
- **Nguyên nhân tiềm năng:** Chặn thao tác ở UI có thể không đủ trước hai lần tap gần như đồng thời hoặc nhiều nguồn dispatch.
- **Hướng giải quyết:** Thêm condition cho thunk hoặc trạng thái request-in-flight; backend cần bảo vệ idempotency/concurrency độc lập.
- **Kiểm thử sau sửa:** Tap liên tục nhiều lần; hai request cùng answer; answer đồng thời timeout.

### FE-AUTH-001 — Kiểm tra luồng restore session khi token hết hạn
- **File:** mobile/src/services/api.js; mobile/src/redux/slices/authSlice.js.
- **Mức độ:** Low/Medium.
- **Trạng thái:** Needs verification.
- **Mô tả:** Interceptor 401 xóa token và gọi unauthorizedHandler; restoreSession gọi getCurrentUser và nếu lỗi sẽ đưa user/token về null. Cần kiểm tra AppNavigator có đăng ký handler và xử lý state initialized/loading để tránh nhấp nháy hoặc điều hướng lặp.
- **Hướng giải quyết:** Kiểm tra đăng ký handler một lần, điều hướng auth nhất quán và phân biệt lỗi mạng tạm thời với token không hợp lệ.
- **Kiểm thử:** Token hợp lệ, token hết hạn, server offline lúc mở app, logout khi đang request.

### FE-GAME-003 — Luồng answer result cần kiểm tra trạng thái sau game over
- **File:** mobile/src/redux/slices/gameSlice.js; mobile/src/screens/game/GameScreen.js.
- **Mức độ:** Low.
- **Trạng thái:** Needs verification.
- **Mô tả:** Khi answer fulfilled, currentQuestion được gán result.question || null; GameScreen điều hướng Result khi answerResult.gameOver. Cần kiểm tra các kết quả practice, millionaire, timeout và stop đều tạo đủ dữ liệu Result screen cần.
- **Hướng giải quyết:** Chuẩn hóa response result thành một contract thống nhất và viết reducer/thunk tests.
- **Kiểm thử:** Thua do sai; thắng level cuối; hết giờ; dừng game; hoàn thành practice.

## 5. Đề xuất cải thiện

- Định nghĩa TypeScript/JSDoc contract cho response API, dù dự án hiện dùng JavaScript.
- Tạo component/hook timer riêng để tách logic thời gian khỏi GameScreen.
- Thêm selector memoized nếu state lớn và nhiều màn hình dùng chung.
- Có test cho reducer và thunk quan trọng.
- Bổ sung accessibilityLabel cho các nút trợ giúp, lựa chọn đáp án và timer.
- Đảm bảo state game được clear khi bắt đầu game mới hoặc logout.
- Kiểm tra UI loading/empty/error cho lịch sử, ranking, profile và admin.

## 6. Kiểm tra hồi quy frontend

- [ ] Login/register/restore/logout.
- [ ] Token 401 tự xử lý đúng.
- [ ] Start game và start Smart Practice.
- [ ] Chọn đáp án đúng/sai và hiển thị giải thích.
- [ ] 50:50, khán giả, gọi điện; không dùng lại trợ giúp.
- [ ] Timer khi app background/foreground.
- [ ] Stop game và back navigation.
- [ ] History/detail/ranking/statistics.
- [ ] Kiểm tra Android kích thước màn hình nhỏ và trạng thái mạng yếu.

## 7. Kết luận

Frontend có phân tách service/state/UI khá rõ và quản lý lỗi tập trung. Không cần viết lại kiến trúc hiện tại. Ưu tiên xác minh timer, chống request lặp và kiểm tra response contract ở mọi trạng thái kết thúc game.
