# AI Millionaire — Review Task

> Phạm vi: review mã nguồn trên nhánh `main` tại thời điểm tạo tài liệu. Đây là checklist review kỹ thuật kết hợp chuẩn bị đồ án tốt nghiệp.
>
> Quy ước:
> - **Confirmed**: Có bằng chứng trực tiếp trong mã nguồn đã đọc.
> - **Needs verification**: Có dấu hiệu rủi ro; cần chạy thử hoặc đọc thêm luồng liên quan.
> - **Improvement**: Đề xuất nâng chất lượng, chưa khẳng định là lỗi.
> - Không xem việc có script test là bằng chứng test đã chạy hoặc đã đạt.

## 1. Findings đã xác nhận

### [P1] Giới hạn và kiểm tra đầu vào khi sinh câu hỏi AI
- **File:** `backend/src/controllers/ai-question.controller.js`
- **Hiện trạng:** Controller chỉ kiểm tra các trường có truthy value. Chưa kiểm tra `count` là số nguyên dương có giới hạn; `difficulty`, `prize_level`, `category_id` cũng chưa được validate đầy đủ tại lớp API.
- **Ảnh hưởng:** Request sai kiểu hoặc số lượng quá lớn có thể làm tăng chi phí AI, thời gian xử lý và dữ liệu không hợp lệ.
- **Hướng xử lý:** Dùng schema validation (ví dụ Zod/Joi/express-validator); ép kiểu có kiểm soát; giới hạn count; xác nhận difficulty và prize level hợp lệ; trả HTTP 400 kèm lỗi theo field.
- **Kiểm thử:** count = 0, -1, chuỗi, số vượt giới hạn; difficulty không hợp lệ; category không tồn tại; prize_level ngoài 1–15.

### [P1] Lưu batch câu hỏi AI chưa có transaction
- **File:** `backend/src/services/ai-question.service.js`, hàm `saveAIQuestions`
- **Hiện trạng:** Các câu hỏi được INSERT lần lượt bằng `pool.query`. Nếu một câu ở giữa batch lỗi (trùng câu, validation, lỗi DB), các câu đã insert trước đó vẫn còn.
- **Ảnh hưởng:** Một lần sinh batch có thể chỉ lưu được một phần, gây dữ liệu không nhất quán với kết quả API.
- **Hướng xử lý:** Dùng một connection + transaction cho toàn batch; rollback nếu bất kỳ câu nào lỗi. Nếu chủ đích cho phép lưu một phần, cần thiết kế response thể hiện rõ từng câu thành công/thất bại.
- **Kiểm thử:** Cố tình làm câu thứ 2 hoặc 3 không hợp lệ và xác nhận rollback đúng theo chính sách đã chọn.

### [P2] Logic retry Gemini không khớp số vòng lặp
- **File:** `backend/src/services/ai-question.service.js`
- **Hiện trạng:** Vòng lặp cho phép tối đa 5 lần, nhưng chỉ retry lỗi 503 khi `attempt < 3`; lỗi 503 ở lần 3 sẽ bị throw ngay. Vì vậy thực tế tối đa chỉ có 3 lần gọi trong trường hợp 503, không phải 5.
- **Hướng xử lý:** Thống nhất số lần retry; chỉ retry lỗi tạm thời phù hợp; thêm exponential backoff + jitter và timeout; log status/code nhưng không log dữ liệu nhạy cảm.
- **Kiểm thử:** Mock lỗi 503 liên tiếp 1, 2, 3, 4 lần; xác nhận số lần gọi và thời gian chờ.

### [P2] CORS đang mở cho mọi origin
- **File:** `backend/src/app.js`
- **Hiện trạng:** `app.use(cors())` không cấu hình allowlist origin.
- **Ảnh hưởng:** Chính sách truy cập từ trình duyệt rộng hơn mức cần thiết khi triển khai.
- **Hướng xử lý:** Đọc danh sách origin từ environment; chỉ cho phép domain cần thiết theo môi trường. Lưu ý CORS không thay thế authentication/authorization.
- **Kiểm thử:** Origin hợp lệ được chấp nhận; origin không nằm trong allowlist bị từ chối.

### [P2] Thời gian đếm ngược phía mobile dùng đồng hồ cục bộ
- **File:** `mobile/src/screens/game/GameScreen.js`
- **Hiện trạng:** Mỗi lần effect chạy theo `currentQuestion?.id`, thời gian được khởi tạo từ `Date.now()` và đếm 60 giây phía client. Backend có lưu `question_started_at` và tính `response_time_seconds`, nhưng màn hình không dùng timestamp từ server để đồng bộ bộ đếm.
- **Ảnh hưởng:** Khi app bị đưa xuống nền, màn hình được mount lại hoặc thiết bị có độ trễ, thời gian hiển thị có thể lệch với thời gian thực phía server.
- **Hướng xử lý:** Backend trả `questionStartedAt` hoặc `expiresAt`; client tính thời gian còn lại từ mốc server. Backend tiếp tục là nguồn quyết định timeout.
- **Kiểm thử:** Đưa app xuống nền 20 giây rồi quay lại; reload màn hình; gửi answer sát hạn; gửi timeout trễ.

### [P2] Chưa kiểm tra số lượng câu hỏi khả dụng trước khi tạo game
- **File:** `backend/src/services/game.service.js`
- **Hiện trạng:** `startGame` chọn tuần tự một câu hỏi cho từng level 1–15; nếu không tìm thấy câu hỏi đúng `prize_level`, `difficulty` và `status='approved'`, hàm throw và rollback.
- **Ảnh hưởng:** Người chơi không thể bắt đầu game nếu ngân hàng thiếu ít nhất một level phù hợp; lỗi chỉ xuất hiện lúc bắt đầu.
- **Hướng xử lý:** Có API/health check thống kê số câu hỏi approved theo level; kiểm tra đủ dữ liệu trước khi tạo game và trả lỗi thân thiện, chỉ rõ level thiếu.
- **Kiểm thử:** Thiếu câu hỏi ở level 1, level giữa và level 15; xác nhận game không bị tạo dở dang.

## 2. Rủi ro cần xác minh thêm

### [P2] Cạnh tranh khi duyệt/từ chối câu hỏi AI
- **File:** `backend/src/services/ai-question.service.js`, `approveAIQuestion`, `rejectAIQuestion`
- **Dấu hiệu:** Đọc trạng thái hiện tại rồi mới UPDATE; chưa thấy transaction/conditional update bảo đảm trạng thái vẫn là draft tại thời điểm ghi.
- **Cần xác minh:** Hai admin hoặc hai request approve/reject đồng thời có thể ghi đè trạng thái hay không.
- **Đề xuất:** UPDATE có điều kiện `WHERE id = ? AND source = 'ai' AND status = 'draft'`; kiểm tra affectedRows; cân nhắc transaction.

### [P2] Hiệu năng chọn câu hỏi ngẫu nhiên
- **File:** `backend/src/services/game.service.js`
- **Dấu hiệu:** Dùng `ORDER BY RAND() LIMIT 1` khi chọn câu hỏi.
- **Cần xác minh:** Hiệu năng với số lượng câu hỏi lớn và chỉ mục hiện có.
- **Đề xuất:** Benchmark với dữ liệu mô phỏng; cân nhắc chiến lược random phù hợp và composite index theo `status, prize_level, difficulty`.

### [P2] Tính toàn vẹn câu trả lời theo mỗi câu trong game
- **File:** `backend/migrations/db.sql`, `backend/src/services/game.service.js`
- **Dấu hiệu:** Bảng `game_answers` chưa khai báo unique constraint cho cặp `(game_id, question_id)`; service có transaction và khóa dòng game khi trả lời.
- **Cần xác minh:** Các request lặp, retry do mất mạng, hoặc các luồng timeout/answer đồng thời có thể tạo bản ghi trùng trong mọi trường hợp hay không.
- **Đề xuất:** Xây dựng idempotency hoặc unique constraint phù hợp với nghiệp vụ; kiểm tra ảnh hưởng tới chế độ practice.

### [P2] Bảo vệ dữ liệu và validation đăng ký
- **File:** `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`
- **Hiện trạng đã thấy:** Có bcrypt hash mật khẩu và unique constraint username/email ở DB. Controller mới kiểm tra các trường bắt buộc.
- **Cần xác minh:** Độ dài/định dạng email, độ mạnh mật khẩu, trim/lowercase email, giới hạn request và xử lý đăng ký đồng thời.
- **Đề xuất:** Chuẩn hóa email/username; chính sách mật khẩu; rate limit login/register; xử lý duplicate key từ DB rõ ràng.

### [P2] Kiểm tra hợp đồng dữ liệu API mobile/backend
- **Files:** `mobile/src/services/game.service.js`, backend game controller/service
- **Hiện trạng đã thấy:** Mobile gửi `expectedLevel` khi trả lời và timeout. Service kiểm tra expectedLevel khi có truyền vào.
- **Cần xác minh:** Tất cả luồng game (millionaire/practice), resume game và retry request có cùng shape dữ liệu và xử lý stale response nhất quán hay không.

## 3. Checklist kiểm tra tiếp theo

- [ ] Đọc toàn bộ routes/controllers/services của backend, đặc biệt lifelines, smart practice, ranking, statistics, profile và upload.
- [ ] Đọc Redux slices, reducers, thunks và các màn hình mobile liên quan để kiểm tra state lifecycle, loading/error, navigation và xử lý request lặp.
- [ ] Kiểm tra các file migration/schema trong `database/` có đồng bộ với `backend/migrations/db.sql` không.
- [ ] Kiểm tra ERD `database/erd.png` đối chiếu khóa chính, khóa ngoại, cardinality và index.
- [ ] Tìm và đọc toàn bộ test files; chạy test nếu có môi trường phù hợp. Chưa kết luận coverage khi chưa chạy.
- [ ] Kiểm tra cấu hình môi trường, secrets, upload file, logging, error handling và deployment.
- [ ] Thực hiện test luồng end-to-end: register/login → start game → answer đúng/sai → lifelines → timeout → stop → history/detail/ranking.
- [ ] Test AI: generate → validate → draft → approve/reject → xuất hiện trong ngân hàng câu hỏi.
- [ ] Chuẩn bị bằng chứng đồ án: use case, sequence, ERD, kiến trúc hệ thống, ảnh giao diện, API test và bảng test case.

## 4. Ưu tiên khắc phục

1. **P1:** Validation đầu vào AI; transaction khi lưu batch AI.
2. **P2:** CORS allowlist; đồng bộ timer; kiểm tra đủ câu hỏi trước khi start; retry Gemini.
3. **P2:** Race condition duyệt câu hỏi; idempotency câu trả lời; hiệu năng random query.
4. **P3:** Chuẩn hóa auth validation, logging, tài liệu API, test automation và tài liệu bảo vệ.

## 5. Nguồn mã đã kiểm tra

- [AI question service](https://github.com/quachtandat/AI-millionaire/blob/main/backend/src/services/ai-question.service.js)
- [AI question controller](https://github.com/quachtandat/AI-millionaire/blob/main/backend/src/controllers/ai-question.controller.js)
- [Game service](https://github.com/quachtandat/AI-millionaire/blob/main/backend/src/services/game.service.js)
- [Game screen](https://github.com/quachtandat/AI-millionaire/blob/main/mobile/src/screens/game/GameScreen.js)
- [App setup / CORS](https://github.com/quachtandat/AI-millionaire/blob/main/backend/src/app.js)
- [Database schema](https://github.com/quachtandat/AI-millionaire/blob/main/backend/migrations/db.sql)
