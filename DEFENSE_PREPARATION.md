# Defense Preparation — AI Millionaire

## 1. Cách giới thiệu đề tài

“Đề tài của em là phân tích, thiết kế và xây dựng hệ thống trò chơi Ai là triệu phú trên nền tảng di động, sử dụng React Native cho ứng dụng, Node.js/Express cho backend và MySQL để lưu trữ dữ liệu. Điểm mở rộng của hệ thống là tích hợp Gemini AI để hỗ trợ tạo câu hỏi; câu hỏi AI được đưa vào trạng thái nháp và cần quản trị viên kiểm tra, duyệt trước khi sử dụng.”

Điều chỉnh phần giới thiệu theo đúng tính năng đã chạy và có bằng chứng ở bản nộp cuối.

## 2. Câu hỏi hội đồng có thể hỏi

### Q1. Vì sao chọn React Native?
**Gợi ý trả lời:** React Native cho phép xây dựng ứng dụng di động bằng JavaScript/React và chia sẻ phần lớn logic giữa nền tảng. Trong phạm vi đồ án, nhóm có thể tập trung vào nghiệp vụ game và tích hợp API thay vì phát triển hai ứng dụng native độc lập.

### Q2. Vì sao tách frontend và backend?
**Gợi ý trả lời:** Tách client/server giúp phân chia trách nhiệm. Mobile phụ trách giao diện và tương tác; backend xử lý nghiệp vụ, xác thực, kiểm tra đáp án và truy cập database. Điều này giúp API có thể phục vụ nhiều client và dễ kiểm thử hơn.

### Q3. Vì sao dùng MySQL?
**Gợi ý trả lời:** Dữ liệu có quan hệ rõ ràng như user, category, question, game và answer. MySQL hỗ trợ foreign key, transaction và unique constraint, phù hợp để đảm bảo toàn vẹn dữ liệu của phiên chơi.

### Q4. Tại sao không lưu đáp án đúng ở frontend?
**Gợi ý trả lời:** Đáp án đúng phải được giữ ở backend/database. Nếu gửi đáp án đúng xuống client trước khi người chơi chọn, người dùng có thể đọc được từ network response hoặc bộ nhớ ứng dụng. Backend nhận lựa chọn và tự so sánh.

### Q5. Transaction được dùng ở đâu và vì sao?
**Gợi ý trả lời:** Khi tạo game, backend tạo bản ghi game và gán câu hỏi cho các level; các thao tác này cần cùng thành công hoặc rollback. Khi trả lời, backend lưu answer và cập nhật trạng thái/level/prize trong cùng transaction để tránh dữ liệu nửa chừng.

### Q6. SELECT FOR UPDATE giải quyết vấn đề gì?
**Gợi ý trả lời:** Nó khóa bản ghi game trong transaction để hai request đồng thời không cùng cập nhật tiến trình game một cách tùy tiện. Tuy nhiên vẫn cần kiểm thử answer-timeout đồng thời và xử lý request lặp/idempotency.

### Q7. Gemini AI được tích hợp như thế nào?
**Gợi ý trả lời:** Backend gửi prompt đến Gemini để tạo câu hỏi theo chủ đề, độ khó, cấp độ và ngôn ngữ. Backend parse JSON, kiểm tra field/đáp án/options và đánh giá chất lượng/trùng lặp trước khi lưu câu hỏi ở trạng thái draft.

### Q8. Vì sao câu hỏi AI không được đưa thẳng vào game?
**Gợi ý trả lời:** AI có thể tạo nội dung sai hoặc đáp án không chính xác. Vì vậy hệ thống dùng quy trình human-in-the-loop: câu hỏi AI ở trạng thái draft, quản trị viên xem và duyệt trước khi chuyển approved.

### Q9. Nếu AI trả JSON sai thì sao?
**Gợi ý trả lời:** Backend parse JSON và validate cấu trúc, field bắt buộc, đáp án A-D và options không trùng. Nếu không đạt, request thất bại và câu hỏi không được lưu. Cần có test cho response lỗi và lỗi provider.

### Q10. JWT hoạt động thế nào?
**Gợi ý trả lời:** Sau khi đăng nhập hợp lệ, backend ký token chứa định danh user và role. Client gửi token trong Authorization Bearer ở các request cần xác thực. Middleware xác minh chữ ký/hiệu lực token và gắn thông tin user vào request.

### Q11. Làm sao ngăn user truy cập game của người khác?
**Gợi ý trả lời:** Backend không chỉ kiểm tra game ID mà còn truy vấn theo cả game ID và user ID lấy từ token. Do đó người dùng không thể chỉ thay ID trên URL để đọc dữ liệu game của tài khoản khác, nếu tất cả endpoint đều tuân thủ quy tắc này.

### Q12. Smart Practice khác chế độ Millionaire thế nào?
**Gợi ý trả lời:** Millionaire có 15 cấp độ cố định gắn với prize level và độ khó. Smart Practice dùng lịch sử trả lời gần đây để ước lượng accuracy, từ đó chọn độ khó và câu hỏi tiếp theo. Cần giải thích đúng thuật toán hiện tại và fallback nếu thiếu câu hỏi.

### Q13. Làm sao đảm bảo một câu hỏi không bị lặp trong cùng game?
**Gợi ý trả lời:** Khi chọn câu hỏi, service lấy danh sách question_id đã gán cho game và loại trừ các ID đó. Database cũng có unique(game_id, level) và unique(game_id, order_number). Nên trình bày thêm test chứng minh không trùng question_id.

### Q14. Hệ thống xử lý hết giờ thế nào?
**Gợi ý trả lời:** Mobile hiển thị bộ đếm và gửi timeout kèm expectedLevel; backend khóa game và kiểm tra trạng thái/cấp độ để tránh timeout cũ kết thúc câu hỏi mới. Cần cải thiện đồng bộ timer theo timestamp server để hạn chế lệch giờ.

### Q15. Những hạn chế hiện tại là gì?
**Gợi ý trả lời:** Có thể nêu các giới hạn đã xác minh: cần tăng cường validation đầu vào AI, transaction cho batch câu hỏi, đồng bộ timer với server, cấu hình CORS allowlist và mở rộng test tự động. Trình bày kèm kế hoạch khắc phục, không khẳng định hệ thống hoàn hảo.

## 3. Sơ đồ nên chuẩn bị

- Use Case Diagram: guest/user/admin và các chức năng tương ứng.
- System Architecture: React Native → REST API → services → MySQL/Gemini/Supabase (chỉ vẽ tích hợp thực tế).
- ERD: 7 bảng và quan hệ FK.
- Sequence: login; start game; answer question; use lifeline; generate AI question → approve.
- Activity: flow game và quy trình duyệt câu hỏi AI.

## 4. Demo nên thực hiện

1. Đăng nhập bằng tài khoản user.
2. Bắt đầu game và trả lời một câu đúng/sai.
3. Dùng một quyền trợ giúp.
4. Thể hiện history/detail hoặc statistics.
5. Đăng nhập admin.
6. Sinh câu hỏi AI (nếu API key và quota hoạt động).
7. Kiểm tra draft, approve/reject.
8. Chứng minh câu hỏi approved có thể được sử dụng trong game.

Có sẵn video demo dự phòng và dữ liệu câu hỏi đủ cho 15 level. Không demo tính năng phụ thuộc mạng/provider nếu chưa kiểm tra trước.

## 5. Nguyên tắc trả lời hội đồng

- Trả lời theo cấu trúc: mục tiêu → cách triển khai → lý do chọn → giới hạn.
- Chỉ khẳng định tính năng đã chạy và có bằng chứng.
- Khi được hỏi về hạn chế, nêu đúng hạn chế và phương án cải thiện.
- Không nhầm AI sinh câu hỏi với AI tự xác minh độ chính xác tuyệt đối.
- Giải thích rõ backend mới là nơi quyết định đáp án và trạng thái game.
- Chuẩn bị ảnh Postman, ERD, database, log và video demo.

## 6. Những số liệu cần tự bổ sung trước bảo vệ

- Số lượng màn hình/chức năng đã hoàn thiện.
- Số lượng câu hỏi seed và câu hỏi AI được duyệt.
- Số test case đã chạy, số pass/fail.
- Thời gian phản hồi API ở môi trường demo.
- Phiên bản Node.js, MySQL, React Native/Expo và Gemini model thực tế.
- Các thiết bị/phiên bản Android đã kiểm thử.

Không tự điền số liệu ước đoán; chỉ sử dụng kết quả đo thực tế.
