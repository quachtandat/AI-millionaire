# Security Review — AI Millionaire

## 1. Phạm vi và giới hạn

Review tĩnh các phần auth, middleware, routes, CORS, AI generation, database access và mobile token interceptor. Chưa thực hiện penetration test, dependency audit, secret scan toàn repository hoặc kiểm tra môi trường production.

## 2. Điểm kiểm soát đã thấy

- Password hash dùng bcrypt.
- JWT được ký bằng JWT_SECRET và có JWT_EXPIRES_IN.
- Middleware xác thực token và gán req.user.
- Middleware admin kiểm tra role admin.
- Routes AI yêu cầu authenticateToken và requireAdmin.
- Các truy vấn SQL đọc/ghi dữ liệu request dùng placeholder.
- Game queries kiểm tra user_id.
- Mobile lưu token qua storage abstraction; interceptor gắn Bearer token và xử lý 401.

## 3. Findings

### SEC-001 — CORS chưa giới hạn origin
- **File:** backend/src/app.js.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed.
- **Mô tả:** app.use(cors()) đang dùng cấu hình mặc định, không khai báo allowlist origin.
- **Nguyên nhân:** Chưa tách cấu hình CORS theo môi trường.
- **Hướng giải quyết:** Khai báo CORS_ORIGINS; allowlist chính xác domain cần thiết; cấu hình credentials chỉ khi thật sự cần và không kết hợp credentials với wildcard origin.
- **Kiểm thử:** Origin hợp lệ thành công; origin lạ không được cấp CORS headers.

### SEC-002 — AI generation cần giới hạn tài nguyên và chống lạm dụng
- **File:** backend/src/controllers/ai-question.controller.js và routes/ai-question.routes.js.
- **Mức độ:** High.
- **Trạng thái:** Confirmed thiếu giới hạn count; rate limit cần xác minh.
- **Mô tả:** count chưa có upper bound ở controller; endpoint có thể gọi dịch vụ AI bên ngoài. Route có admin guard nhưng chưa thấy rate limiter trong route.
- **Nguyên nhân:** Chưa có giới hạn nghiệp vụ và chống gọi quá mức ở endpoint.
- **Hướng giải quyết:** Validate count, quota theo admin/user, rate limit, timeout và log usage/cost; không để prompt nhận dữ liệu không giới hạn.
- **Kiểm thử:** count lớn bị từ chối; burst requests bị giới hạn; lỗi provider không làm lộ secret.

### SEC-003 — Validation đăng ký/đăng nhập còn tối thiểu
- **File:** backend/src/controllers/auth.controller.js và backend/src/services/auth.service.js.
- **Mức độ:** Medium.
- **Trạng thái:** Confirmed.
- **Mô tả:** Controller kiểm tra trường bắt buộc; chưa thấy schema kiểm tra email/username/password policy và rate limit login.
- **Nguyên nhân:** Chưa có lớp validation và chống brute-force được xác minh.
- **Hướng giải quyết:** Schema validation, chuẩn hóa email, giới hạn độ dài, password policy phù hợp, rate limit theo IP/tài khoản, thông báo lỗi không tiết lộ tài khoản tồn tại khi cần.
- **Kiểm thử:** Login sai liên tiếp; email malformed; payload quá dài; kiểm tra response không tiết lộ thông tin nhạy cảm.

### SEC-004 — Kiểm tra cấu hình secret và môi trường production
- **File:** backend/src/services/auth.service.js, backend/src/middleware/auth.middleware.js, backend/src/config/*.
- **Mức độ:** High nếu cấu hình sai; trạng thái Needs verification.
- **Mô tả:** JWT dựa vào JWT_SECRET; AI/Supabase phụ thuộc environment. Chưa kiểm tra giá trị production, độ mạnh secret hoặc cách quản lý secret.
- **Hướng giải quyết:** Fail-fast khi thiếu secret; secret đủ entropy; không commit .env; rotate secret; tách dev/staging/prod; giới hạn quyền service role key.
- **Kiểm thử:** Khởi động thiếu JWT_SECRET phải fail; secret không xuất hiện trong log/client bundle/repository.

### SEC-005 — Upload avatar cần kiểm tra loại file và kích thước
- **File:** Backend upload route/controller/service cần kiểm tra thêm.
- **Mức độ:** Medium.
- **Trạng thái:** Needs verification.
- **Mô tả:** Dependency multer và Supabase client có trong backend; cần xác minh upload implementation, fileFilter, size limit, content sniffing và storage permissions.
- **Hướng giải quyết:** Chỉ cho phép MIME/extension an toàn; giới hạn dung lượng; kiểm tra magic bytes; tên file do server tạo; không public bucket nếu không cần.
- **Kiểm thử:** Upload file quá lớn, file giả MIME, executable đổi đuôi, file hợp lệ.

### SEC-006 — Authorization ownership cho toàn bộ endpoint cần audit đầy đủ
- **File:** backend/src/routes/* và controllers/services tương ứng.
- **Mức độ:** High nếu endpoint thiếu kiểm tra quyền sở hữu; trạng thái Needs verification.
- **Mô tả:** Game service đã có user_id checks ở một số query; chưa audit toàn bộ profile/history/detail/upload/admin endpoints.
- **Hướng giải quyết:** Với mỗi endpoint lấy id từ URL, xác nhận resource thuộc req.user hoặc yêu cầu role phù hợp.
- **Kiểm thử:** User A thử truy cập/sửa resource của User B; tài khoản thường gọi endpoint admin.

## 4. Checklist bảo mật

- [ ] Secret scan repository và Git history.
- [ ] Kiểm tra .gitignore và file env mẫu.
- [ ] JWT expiration, algorithm và secret rotation.
- [ ] Rate limit login/register/AI.
- [ ] CORS allowlist.
- [ ] Helmet/security headers và HTTPS ở production.
- [ ] Request body size limit.
- [ ] Upload validation và storage policy.
- [ ] Authorization/ownership trên từng endpoint.
- [ ] Error response không lộ stack trace/SQL/provider secrets.
- [ ] Dependency audit và cập nhật package.
- [ ] Backup DB, least privilege DB account.

## 5. Kết luận

Các kiểm soát nền tảng bcrypt/JWT/admin middleware/parameterized SQL đã có. Rủi ro đáng ưu tiên là giới hạn tài nguyên endpoint AI, cấu hình CORS, validation/rate limiting auth và xác minh secrets/upload/ownership toàn hệ thống. Đây là review tĩnh, không thay thế kiểm thử bảo mật chuyên sâu.
