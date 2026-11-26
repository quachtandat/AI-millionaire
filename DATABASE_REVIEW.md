# Database Review — AI Millionaire

## 1. Phạm vi

Nguồn schema đã đọc: backend/migrations/db.sql. Repository cũng có thư mục database và ERD dạng PNG; cần đối chiếu trực tiếp ảnh ERD và toàn bộ SQL trong thư mục đó trước khi kết luận schema cuối cùng đã đồng bộ.

## 2. Các bảng đã xác nhận trong schema

| Bảng | Vai trò |
|---|---|
| users | Tài khoản, email, password hash, role |
| categories | Danh mục câu hỏi |
| questions | Nội dung, đáp án, độ khó, prize level, trạng thái, nguồn |
| games | Phiên chơi, user, level, prize, trạng thái, mode |
| game_questions | Các câu hỏi được gán vào một game và level |
| game_answers | Câu trả lời người chơi |
| game_lifelines | Trợ giúp đã dùng trong game |

## 3. Điểm làm tốt

- Primary key tự tăng ở các bảng.
- users.username và users.email có unique.
- questions có FK tới categories và users.
- games có FK tới users.
- game_questions có FK tới games/questions và unique(game_id, level), unique(game_id, order_number).
- game_answers có FK tới games/questions.
- game_lifelines có unique(game_id, lifeline_type).
- ENUM được dùng để giới hạn một số trạng thái, vai trò, độ khó và đáp án.
- ON DELETE được cân nhắc theo nghiệp vụ: xóa user cascade game; xóa creator set null; category restrict; game_questions/game_answers cascade theo game.

## 4. Findings

### DB-001 — Chưa có unique constraint cho câu trả lời theo game và question
- **File:** backend/migrations/db.sql, bảng game_answers.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed schema gap; tác động runtime cần xác minh.
- **Mô tả:** Bảng có FK game_id và question_id nhưng chưa có unique(game_id, question_id).
- **Nguyên nhân:** Schema chưa áp đặt trực tiếp quy tắc một câu hỏi chỉ có một câu trả lời trong cùng game.
- **Hướng giải quyết:** Trước khi thêm unique, kiểm tra nghiệp vụ practice và dữ liệu hiện có. Nếu mỗi câu chỉ được trả lời một lần, thêm unique key; nếu cho phép retry/history, dùng request id/idempotency key hoặc bảng attempt riêng.
- **Kiểm thử:** Gửi cùng answer nhiều lần và answer-timeout đồng thời; xác nhận một kết quả hợp lệ, không nhân đôi lịch sử.

### DB-002 — Chưa thấy CHECK constraint cho level và prize level
- **File:** backend/migrations/db.sql, questions.prize_level, games.current_level, game_questions.level.
- **Mức độ:** Low/Medium.
- **Trạng thái:** Confirmed schema gap.
- **Mô tả:** Các cột level/prize_level là INT NOT NULL nhưng schema không có CHECK giới hạn 1–15.
- **Nguyên nhân:** Phần lớn quy tắc đang được kiểm tra ở tầng ứng dụng.
- **Hướng giải quyết:** Cân nhắc CHECK (prize_level BETWEEN 1 AND 15), CHECK level tương ứng; xác nhận phiên bản MySQL mục tiêu hỗ trợ enforcement. Validate ở backend vẫn cần thiết.
- **Kiểm thử:** Insert level 0/16 trực tiếp vào DB phải bị từ chối nếu áp dụng constraint.

### DB-003 — Thiếu index tường minh cho các truy vấn lọc câu hỏi
- **File:** backend/migrations/db.sql, bảng questions.
- **Mức độ:** Low/Medium.
- **Trạng thái:** Needs benchmark.
- **Mô tả:** Các luồng chọn câu hỏi lọc theo status, prize_level, difficulty; schema hiện không khai báo composite index tương ứng.
- **Nguyên nhân:** Chưa tối ưu index theo pattern truy vấn.
- **Hướng giải quyết:** Dùng EXPLAIN/EXPLAIN ANALYZE trên dữ liệu thực tế; cân nhắc index (status, prize_level, difficulty) và index cho các truy vấn category/difficulty. Tránh thêm index không có số liệu.
- **Kiểm thử:** So sánh query plan và latency trước/sau với dataset đủ lớn.

### DB-004 — Độ nhất quán giữa SQL trong database/ và backend migration chưa được xác minh
- **File:** database/* và backend/migrations/db.sql.
- **Mức độ:** Medium.
- **Trạng thái:** Needs verification.
- **Mô tả:** Có nhiều nguồn SQL/schema trong repository. Cần so sánh cấu trúc cột, enum, FK, index và seed data để tránh tài liệu ERD phản ánh schema khác với backend đang chạy.
- **Hướng giải quyết:** Chọn một nguồn migration chuẩn; ghi rõ version/schema; cập nhật ERD từ schema chuẩn.
- **Kiểm thử:** Tạo DB mới từ migration chuẩn và so sánh SHOW CREATE TABLE với ERD/tài liệu.

## 5. Lưu ý khi đọc ERD

ERD nên thể hiện tối thiểu:
- users 1—N games
- users 1—N questions (created_by có thể NULL)
- categories 1—N questions
- games 1—N game_questions
- questions 1—N game_questions
- games 1—N game_answers
- questions 1—N game_answers
- games 1—N game_lifelines

Các cardinality này cần đối chiếu với FK thực tế và ảnh ERD trong database/ trước khi đưa vào báo cáo tốt nghiệp.

## 6. Kiểm tra database sau review

- [ ] Chạy migration trên MySQL version dự kiến triển khai.
- [ ] SHOW CREATE TABLE cho đủ 7 bảng.
- [ ] Đối chiếu FK, unique, index và ON DELETE/ON UPDATE.
- [ ] Kiểm tra orphan records và dữ liệu trùng.
- [ ] EXPLAIN các truy vấn start game, Smart Practice, history, ranking.
- [ ] Kiểm tra backup/restore và charset utf8mb4.
- [ ] Xác định cách version hóa migration, tránh chỉnh sửa schema thủ công không lưu lại.

## 7. Kết luận

Schema có quan hệ và ràng buộc nền tảng tương đối đầy đủ. Hai nội dung cần ưu tiên xác minh là quy tắc chống duplicate câu trả lời và việc đồng bộ các file SQL/ERD. Chỉ bổ sung index/constraint sau khi đối chiếu nghiệp vụ và kiểm thử dữ liệu hiện hữu.
