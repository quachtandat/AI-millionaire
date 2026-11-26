# AI Millionaire — Tổng hợp báo cáo review

**Repository:** quachtandat/AI-millionaire  
**Nhánh được review:** main  
**Nhánh lưu tài liệu:** review/ai-millionaire-audit  
**Phạm vi:** mã nguồn mobile React Native, backend Node.js/Express, MySQL, luồng game và AI question generation.

## 1. Tóm tắt điều hành

Dự án đã có nền tảng tương đối rõ: mobile tách service API và Redux Toolkit; backend tách controller/service/routes/middleware; database có khóa ngoại, enum trạng thái và unique key cho một số quan hệ; luồng trả lời game dùng transaction và khóa dòng game; AI question có quy trình draft/approve/reject.

Các vấn đề nên ưu tiên:
1. Validate dữ liệu đầu vào API sinh câu hỏi AI và giới hạn số lượng.
2. Bọc thao tác lưu nhiều câu hỏi AI trong transaction để tránh lưu batch dở dang.
3. Đồng bộ timer mobile với mốc thời gian do server quản lý.
4. Cấu hình CORS theo allowlist khi triển khai.
5. Kiểm tra đủ câu hỏi theo từng level trước khi tạo game.
6. Xác minh tính idempotent của answer/timeout và cạnh tranh khi approve/reject câu hỏi.

**Đây là review tĩnh theo các file được đọc trong repository, không phải chứng nhận bảo mật hay xác nhận ứng dụng đã chạy ổn định.** Chưa thực hiện chạy backend/mobile, test database thật, kiểm thử tải hoặc kiểm thử xâm nhập.

## 2. Điểm đã triển khai tốt

- Backend có phân tầng routes, controllers, services, middleware và config.
- SQL dùng truy vấn tham số hóa với placeholder cho dữ liệu người dùng.
- Mật khẩu được hash bằng bcrypt trước khi lưu.
- API game yêu cầu JWT; truy vấn game có điều kiện user_id để giới hạn quyền sở hữu.
- Luồng answer và timeout khóa bản ghi game bằng FOR UPDATE và dùng transaction.
- Schema có foreign key, unique username/email, unique game-level/order và unique lifeline theo game.
- Mobile có Axios interceptor gắn Bearer token và xử lý 401 tập trung.
- Redux Toolkit quản lý trạng thái loading/error cho các luồng game và auth.
- AI-generated questions được lưu trạng thái draft; route AI được bảo vệ bằng authenticateToken và requireAdmin.

## 3. Findings chính

| ID | Mức độ | Finding | Trạng thái |
|---|---|---|---|
| AI-API-001 | High | Validation đầu vào generate AI chưa chặt, count chưa có giới hạn | Confirmed |
| AI-DB-001 | High | Lưu batch AI không transaction | Confirmed |
| AI-INT-001 | Medium | Retry 503 không khớp số vòng lặp dự kiến | Confirmed |
| BE-SEC-001 | Medium | CORS mở origin mặc định | Confirmed |
| GAME-UX-001 | Medium | Timer client khởi tạo theo Date.now thay vì đồng bộ timestamp server | Confirmed |
| GAME-DATA-001 | Medium | Start game có thể rollback nếu thiếu câu hỏi ở bất kỳ level nào | Confirmed behavior; UX risk |
| AI-RACE-001 | Medium | Race condition approve/reject cần kiểm tra và gia cố | Needs verification |
| GAME-IDEMP-001 | Medium | Chưa có unique game_id/question_id ở game_answers; cần xác minh request lặp | Needs verification |
| DB-PERF-001 | Low/Medium | ORDER BY RAND có thể tốn chi phí khi dữ liệu lớn | Improvement / benchmark |
| AUTH-VAL-001 | Medium | Validation đăng ký mới kiểm tra trường bắt buộc | Confirmed |

Chi tiết từng lỗi nằm trong FRONTEND_REVIEW.md, BACKEND_REVIEW.md, DATABASE_REVIEW.md và SECURITY_REVIEW.md.

## 4. Kiến trúc quan sát được

- **Mobile:** React Native + Expo, React Navigation, Redux Toolkit, Axios, AsyncStorage.
- **Backend:** Node.js, Express 5, mysql2, JWT, bcrypt, Google GenAI SDK, Supabase client.
- **Database:** MySQL với các bảng users, categories, questions, games, game_questions, game_answers, game_lifelines.
- **AI workflow:** admin gửi yêu cầu sinh câu hỏi → kiểm tra dữ liệu/chất lượng/trùng lặp → lưu draft → admin approve hoặc reject.

## 5. Kế hoạch khắc phục theo thứ tự

### P1 — Trước khi demo/bảo vệ
- [ ] AI-API-001: schema validation và giới hạn count.
- [ ] AI-DB-001: transaction cho toàn bộ batch hoặc response partial-result minh bạch.
- [ ] Chạy test luồng tạo câu hỏi AI và xác nhận không phát sinh dữ liệu dở dang.

### P2 — Tăng độ tin cậy
- [ ] GAME-UX-001: dùng server timestamp/expiresAt cho timer.
- [ ] BE-SEC-001: cấu hình CORS allowlist theo môi trường.
- [ ] GAME-DATA-001: kiểm tra đủ câu hỏi theo level trước khi insert game.
- [ ] AI-INT-001: retry có backoff và giới hạn rõ.
- [ ] Xác minh AI-RACE-001 và GAME-IDEMP-001 bằng test cạnh tranh/request lặp.

### P3 — Hoàn thiện sản phẩm và đồ án
- [ ] Benchmark DB-PERF-001.
- [ ] AUTH-VAL-001: chuẩn hóa email, username và password policy.
- [ ] Bổ sung test tự động và tài liệu API.
- [ ] Hoàn thiện sơ đồ kiến trúc, ERD, use case, sequence và bảng test case.

## 6. Giới hạn và bằng chứng còn thiếu

- Chưa xác minh toàn bộ màn hình mobile và mọi service/controller.
- Chưa kiểm tra đầy đủ tất cả file trong database/ và đối chiếu ảnh ERD.
- Chưa xác nhận test files tồn tại/đạt; package backend chỉ khai báo script node --test.
- Chưa chạy app trên thiết bị, chưa chạy migration trên DB sạch.
- Chưa kiểm thử phân quyền admin bằng tài khoản thường trên môi trường chạy.
- Chưa đánh giá cấu hình production, secret rotation, logging, rate limit và upload end-to-end.

## 7. Kết luận

Dự án có cấu trúc và các luồng nghiệp vụ quan trọng đã được triển khai. Nên tập trung sửa tính toàn vẹn dữ liệu AI, xác thực đầu vào, đồng bộ thời gian game và kiểm soát truy cập trước khi mở rộng tính năng. Không nên viết lại các phần đang có transaction, ownership check, bcrypt/JWT hoặc Redux/API interceptor nếu chưa có test chứng minh chúng sai; thay vào đó bổ sung test hồi quy trước khi chỉnh sửa.

## 8. Tài liệu liên quan

- REVIEW_TASK.md
- FRONTEND_REVIEW.md
- BACKEND_REVIEW.md
- DATABASE_REVIEW.md
- SECURITY_REVIEW.md
- TESTING_REVIEW.md
- DEFENSE_PREPARATION.md
