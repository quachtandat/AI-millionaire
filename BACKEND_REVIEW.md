# Backend Review — AI Millionaire

## 1. Phạm vi

Các file đã đọc:
- backend/src/services/game.service.js
- backend/src/services/practice.service.js
- backend/src/services/ai-question.service.js
- backend/src/controllers/ai-question.controller.js
- backend/src/controllers/game.controller.js
- backend/src/controllers/auth.controller.js
- backend/src/services/auth.service.js
- backend/src/routes/game.routes.js
- backend/src/routes/ai-question.routes.js
- backend/src/middleware/auth.middleware.js
- backend/src/middleware/admin.middleware.js
- backend/src/app.js
- backend/package.json

## 2. Điểm làm tốt

- Có tách routes/controllers/services.
- Các query dữ liệu người dùng dùng placeholder.
- startGame tạo game và 15 game_questions trong transaction; lỗi sẽ rollback.
- answerCurrentQuestion dùng transaction và SELECT ... FOR UPDATE trên game của đúng user.
- timeoutGame cũng khóa game và kiểm tra expectedLevel để tránh timeout cũ kết thúc câu hỏi mới.
- getGameById/getCurrentQuestion/getGameDetail kiểm tra user_id.
- Auth hash password bằng bcrypt và ký JWT.
- Route AI có authenticateToken + requireAdmin.
- AI question workflow có kiểm tra cấu trúc JSON, đáp án A-D, options không trùng, chất lượng và duplicate.

## 3. Findings

### BE-AI-001 — Validation generate AI chưa đủ chặt
- **File:** backend/src/controllers/ai-question.controller.js, generateQuestions.
- **Mức độ:** High.
- **Trạng thái:** Confirmed.
- **Mô tả:** Controller chỉ kiểm tra các giá trị truthy cho topic/difficulty/prize_level/count/category_id. Chưa kiểm tra count là integer trong giới hạn, difficulty thuộc enum, prize_level trong 1–15 và category_id là positive integer.
- **Nguyên nhân:** Validation thủ công chỉ kiểm tra trường bắt buộc.
- **Hướng giải quyết:** Dùng schema validator; ép kiểu và kiểm tra giới hạn; trả 400 theo field; xác nhận category tồn tại trước khi gọi AI để tránh tốn chi phí không cần thiết.
- **Kiểm thử:** count 0, -1, 1.5, chuỗi, giá trị cực lớn; difficulty sai; prize_level 16; category_id sai/không tồn tại.

### BE-AI-002 — Lưu batch câu hỏi AI không có transaction
- **File:** backend/src/services/ai-question.service.js, saveAIQuestions.
- **Mức độ:** High.
- **Trạng thái:** Confirmed.
- **Mô tả:** INSERT từng câu bằng pool.query. Nếu câu sau bị duplicate/validation hoặc DB lỗi, câu đã insert trước đó vẫn tồn tại.
- **Nguyên nhân:** Không dùng connection transaction cho cả batch.
- **Hướng giải quyết:** Lấy connection, beginTransaction, insert tất cả, commit khi hoàn tất; rollback khi lỗi; release trong finally. Nếu muốn partial success thì API phải trả kết quả từng phần rõ ràng.
- **Kiểm thử:** Cố tình làm câu 2 lỗi sau khi câu 1 insert; xác nhận rollback hoặc response partial theo thiết kế.

### BE-AI-003 — Retry 503 không khớp giới hạn vòng lặp
- **File:** backend/src/services/ai-question.service.js, generateQuestions.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed.
- **Mô tả:** for chạy attempt đến 5 nhưng lỗi 503 chỉ continue khi attempt < 3; lỗi lần 3 bị throw nên không sử dụng đủ 5 lần như vòng lặp gợi ý.
- **Nguyên nhân:** Điều kiện retry và giới hạn vòng lặp không thống nhất.
- **Hướng giải quyết:** Định nghĩa MAX_RETRIES rõ; exponential backoff + jitter; chỉ retry lỗi tạm thời; timeout và log mã lỗi.
- **Kiểm thử:** Mock 503 1–5 lần và xác nhận số lần retry; không retry lỗi 400/401.

### BE-GAME-001 — Start game thất bại nếu thiếu câu hỏi ở bất kỳ level
- **File:** backend/src/services/game.service.js, getRandomQuestionForLevel/startGame.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed behavior.
- **Mô tả:** startGame chọn một câu approved theo từng level 1–15; nếu level nào không có câu phù hợp, throw và rollback toàn bộ game.
- **Nguyên nhân:** Nghiệp vụ yêu cầu đủ câu hỏi cho từng prize level/difficulty.
- **Hướng giải quyết:** Thêm kiểm tra availability theo từng level trước khi tạo game; trả lỗi thân thiện nêu level thiếu; có dashboard thống kê ngân hàng câu hỏi.
- **Kiểm thử:** Thiếu câu level 1, 8, 15; xác nhận không tồn tại game dở dang và thông báo đúng.

### BE-GAME-002 — Truy vấn chọn câu hỏi dùng ORDER BY RAND
- **File:** backend/src/services/game.service.js và backend/src/services/practice.service.js.
- **Mức độ:** Low/Medium.
- **Trạng thái:** Improvement; cần benchmark.
- **Mô tả:** Chọn câu hỏi bằng ORDER BY RAND() LIMIT 1.
- **Nguyên nhân:** Cách chọn ngẫu nhiên đơn giản.
- **Hướng giải quyết:** Benchmark với quy mô câu hỏi dự kiến; cân nhắc random ID range hoặc bảng candidate/cache phù hợp. Không thay đổi trước khi đo.
- **Kiểm thử:** So sánh latency và execution plan ở dữ liệu 1k/10k/100k câu hỏi.

### BE-AI-004 — Approve/reject có cửa sổ race condition tiềm năng
- **File:** backend/src/services/ai-question.service.js, approveAIQuestion/rejectAIQuestion.
- **Mức độ:** Medium.
- **Trạng thái:** Needs verification.
- **Mô tả:** Đọc status/source, kiểm tra draft, sau đó UPDATE theo id; UPDATE chưa gắn điều kiện status='draft' trong câu lệnh.
- **Nguyên nhân:** Kiểm tra trạng thái và ghi trạng thái là hai thao tác riêng.
- **Hướng giải quyết:** UPDATE ... WHERE id=? AND source='ai' AND status='draft'; kiểm tra affectedRows; cân nhắc transaction.
- **Kiểm thử:** Gửi approve và reject đồng thời; chỉ một chuyển trạng thái được chấp nhận.

### BE-AUTH-001 — Validation đăng ký còn tối thiểu
- **File:** backend/src/controllers/auth.controller.js.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed.
- **Mô tả:** Chỉ kiểm tra username/email/password có tồn tại; chưa thấy kiểm tra format, độ dài và policy tại controller/service.
- **Nguyên nhân:** Chưa có schema validation đầu vào.
- **Hướng giải quyết:** Chuẩn hóa email, trim username, giới hạn độ dài, password policy; vẫn giữ unique constraint DB để xử lý race.
- **Kiểm thử:** Email sai định dạng, username quá dài, password quá ngắn, đăng ký đồng thời email trùng.

## 4. Các điểm cần đọc/kiểm thử tiếp

- Lifeline service: tính đúng của 50:50, audience, phone và unique usage.
- Upload avatar: giới hạn loại file/kích thước, storage policy và xóa file cũ.
- Ranking/statistics: quyền truy cập, pagination và truy vấn nặng.
- Error middleware: không lộ stack trace/secret ở production.
- Rate limit login, register và AI generation.
- Cấu hình environment bắt buộc và kiểm tra JWT_SECRET.
- Smart Practice: thuật toán chọn độ khó và fallback category/difficulty.

## 5. Kết luận

Backend có nền tảng transaction và ownership checks tốt ở luồng game chính. Các ưu tiên rõ nhất là validate đầu vào AI, transaction lưu batch, xử lý retry và cải thiện tính nguyên tử của trạng thái approve/reject. Giữ lại các transaction/locking hiện có và bổ sung test hồi quy trước khi refactor.
