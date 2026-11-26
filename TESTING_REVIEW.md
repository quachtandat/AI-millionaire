# Testing Review — AI Millionaire

## 1. Trạng thái hiện tại

backend/package.json khai báo script test là node --test. Điều này chỉ xác nhận có lệnh chạy test; chưa chứng minh repository có test cases hoặc test đã pass. Chưa thực thi test trong môi trường project.

## 2. Test cases đề xuất

### A. Authentication

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| AUTH-T01 | Đăng ký dữ liệu hợp lệ | Tạo user, password được hash |
| AUTH-T02 | Email đã tồn tại | HTTP 400, không tạo user mới |
| AUTH-T03 | Thiếu trường bắt buộc | HTTP 400 |
| AUTH-T04 | Login đúng | Trả JWT và user profile |
| AUTH-T05 | Sai mật khẩu | Bị từ chối, không tiết lộ password hash |
| AUTH-T06 | Token hết hạn/không hợp lệ | HTTP 401 |
| AUTH-T07 | User gọi endpoint admin | HTTP 403 |

### B. Millionaire game

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| GAME-T01 | Start khi đủ câu hỏi 15 level | Tạo game và 15 game_questions |
| GAME-T02 | Thiếu câu hỏi ở một level | Rollback, không tạo game dở dang |
| GAME-T03 | Trả lời đúng level 1–14 | Lưu answer, tăng level và prize |
| GAME-T04 | Trả lời sai | Game chuyển lost |
| GAME-T05 | Trả lời đúng level 15 | Game won, prize cuối |
| GAME-T06 | Dừng game | Game stopped |
| GAME-T07 | User khác truy cập game | Không trả dữ liệu |
| GAME-T08 | expectedLevel cũ | Không xử lý câu hỏi mới |
| GAME-T09 | Answer và timeout đồng thời | Chỉ một chuyển trạng thái hợp lệ |
| GAME-T10 | Tap/retry answer nhiều lần | Không nhân đôi kết quả |

### C. Lifelines

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| LIFE-T01 | Dùng 50:50 lần đầu | Trả đúng 2 đáp án bị loại, gồm đáp án sai |
| LIFE-T02 | Dùng 50:50 lần hai | Bị từ chối |
| LIFE-T03 | Dùng audience | Tổng tỷ lệ hợp lệ theo thiết kế |
| LIFE-T04 | Dùng phone | Trả advice hợp lệ |
| LIFE-T05 | Dùng lifeline sau game over | Bị từ chối |
| LIFE-T06 | User khác dùng lifeline | Không truy cập được game |

### D. Smart Practice

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| PRACT-T01 | Start không chọn category | Tạo game practice |
| PRACT-T02 | Category không tồn tại | HTTP 400 |
| PRACT-T03 | Không đủ câu hỏi approved | Thông báo rõ, rollback |
| PRACT-T04 | Câu trả lời đúng/sai | Tiến trình practice đúng |
| PRACT-T05 | Hoàn thành đủ câu | Game won |
| PRACT-T06 | Không lặp câu trong cùng game | Không có question_id trùng |

### E. AI question workflow

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| AI-T01 | Admin sinh batch hợp lệ | Câu hỏi được lưu draft |
| AI-T02 | User thường gọi generate | HTTP 403 |
| AI-T03 | count ngoài giới hạn | HTTP 400 |
| AI-T04 | AI trả JSON sai | Không lưu câu hỏi |
| AI-T05 | Đáp án không thuộc A-D | Không lưu câu hỏi |
| AI-T06 | Options trùng nhau | Không lưu câu hỏi |
| AI-T07 | Câu trùng trong batch | Không lưu batch hoặc response partial theo thiết kế |
| AI-T08 | Lỗi DB giữa batch | Rollback toàn batch |
| AI-T09 | Approve draft hợp lệ | Status approved |
| AI-T10 | Approve câu đã rejected | Bị từ chối |
| AI-T11 | Approve/reject đồng thời | Chỉ một chuyển trạng thái được chấp nhận |

### F. Database/API robustness

| ID | Trường hợp | Kết quả mong đợi |
|---|---|---|
| DB-T01 | Query có ký tự SQL injection | Dữ liệu được xử lý như input |
| DB-T02 | Foreign key không hợp lệ | DB từ chối |
| DB-T03 | Username/email trùng | Unique constraint chặn |
| DB-T04 | Xóa game | Các game_questions/answers/lifelines cascade đúng |
| API-T01 | Request body quá lớn | Bị giới hạn |
| API-T02 | Server DB ngắt kết nối | Lỗi được xử lý, không treo request |
| API-T03 | Origin không cho phép | Không được CORS cấp quyền |

## 3. Test frontend

- [ ] Loading/error/empty state của từng màn hình.
- [ ] Double tap answer/lifeline/stop.
- [ ] Mất mạng trong lúc answer và retry.
- [ ] Background/foreground khi timer chạy.
- [ ] App kill/relaunch khi game đang chơi.
- [ ] Token hết hạn khi đang ở game.
- [ ] Android back button và beforeRemove.
- [ ] Kích thước màn hình nhỏ, font scale và accessibility.

## 4. Test strategy đề xuất

1. Unit test: validation, chooseDifficulty, prize-level mapping, reducer.
2. Integration test: controller/service với MySQL test database.
3. API test: auth, role, ownership, status transitions.
4. E2E test: luồng game và AI workflow.
5. Regression test: chạy lại các test quan trọng sau mỗi lần sửa.
6. Performance test: query chọn câu hỏi, history/ranking, AI generation quota.

## 5. Tiêu chí hoàn thành

- Test case có ID, precondition, steps, expected, actual, status và evidence.
- Không đánh dấu PASS nếu chưa chạy.
- Test database riêng, không chạy destructive tests trên dữ liệu thật.
- Lưu Postman collection hoặc test scripts và ảnh/video bằng chứng cho báo cáo.
- Các lỗi P1 phải có regression test trước khi merge.

## 6. Kết luận

Bộ test trên là kế hoạch kiểm thử cần thực hiện, không phải kết quả chạy test. Cần bổ sung test tự động cho các luồng có transaction/concurrency và lưu lại bằng chứng để phục vụ báo cáo tốt nghiệp.
