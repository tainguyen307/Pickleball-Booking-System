# HỆ THỐNG QUẢN LÝ & ĐẶT SÂN PICKLEBALL (FULL REQUIREMENTS)

## 1. USER (Người chơi)

### 1.1 Đặt sân (Book Court)
* Xem danh sách sân theo khu vực
* Xem chi tiết sân:
    * Hình ảnh sân
    * Giá theo giờ
* Chọn:
    * Loại sân (indoor/outdoor)
    * Ngày chơi
    * Khung giờ
* Xem lịch trống theo thời gian thực (hoặc mock)
* Đặt sân theo slot (1h / 2h / nhiều slot liên tiếp)
* Hủy / đổi lịch đặt sân (theo điều kiện)

### 1.2 Thuê thiết bị (Rent Equipment)
* Người dùng có thể thuê kèm khi đặt sân:
    * **Thiết bị:** Vợt pickleball (paddle), Bóng
    * Phụ kiện hỗ trợ (nếu có)
* Chức năng:
    * Chọn thiết bị + số lượng
    * Tính phí thuê theo: giờ hoặc lượt
    * Hiển thị tổng chi phí: sân + thiết bị
    * Ghi nhận trạng thái: đang thuê, đã trả, hư hỏng (nếu có)

### 1.3 Tài khoản người dùng
* Đăng ký / đăng nhập
* Quản lý hồ sơ cá nhân: tên, số điện thoại
* Lịch sử đặt sân
* Lịch sử thuê thiết bị

### 1.4 Quản lý booking cá nhân
* Xem danh sách booking
* Trạng thái booking: `pending`, `confirmed`, `cancelled`, `completed`
* Chi tiết từng booking: sân, giờ chơi, thiết bị thuê

### 1.5 Thông báo
* Đặt sân thành công
* Nhắc lịch chơi
* Hủy / thay đổi lịch
* Nhắc trả thiết bị

---

## 2. ADMIN (Quản trị hệ thống)

### 2.1 Quản lý sân (Manage Courts)
* Thêm sân mới
* Cập nhật thông tin sân: giá, hình ảnh, trạng thái hoạt động
* Xóa / ẩn sân
* Block sân theo thời gian (bảo trì)

### 2.2 Quản lý đặt sân (Manage Bookings)
* Xem tất cả booking
* Lọc theo: ngày, sân, trạng thái
* Xác nhận / hủy booking
* Quản lý lịch sân theo timeline

### 2.3 Quản lý thiết bị (Inventory Management)
* Quản lý kho thiết bị: vợt, bóng
* Chức năng: nhập kho (stock in), xuất kho (khi cho thuê), theo dõi tồn kho
* Trạng thái thiết bị: `available`, `in use`, `damaged`, `lost`

### 2.4 Quản lý bảo trì (Maintenance Management)
* Tạo yêu cầu bảo trì:
    * Sân (lưới, nền, đèn)
    * Thiết bị (vợt hỏng, bóng hư)
* Trạng thái bảo trì: `reported`, `in progress`, `completed`
* Block sân khi đang bảo trì
* Lịch sử bảo trì

### 2.5 Analytics (Thống kê)
* Tổng số booking theo ngày/tháng
* Doanh thu từ: đặt sân, thuê thiết bị
* Tỷ lệ lấp đầy sân
* Thiết bị được thuê nhiều nhất / hỏng nhiều nhất
* Giờ cao điểm sử dụng sân

### 2.6 Quản lý người dùng
* Danh sách user
* Xem lịch sử đặt sân / thuê thiết bị
* Khóa / mở tài khoản

---

## 3. HỆ THỐNG (SYSTEM CORE)

### Authentication & Authorization
* Đăng ký / đăng nhập
* JWT authentication
* Phân quyền: `USER` và `ADMIN`

### Booking Engine (Rất quan trọng)
* Kiểm tra trùng giờ
* Slot booking theo giờ cố định (30p/1h)
* Không cho đặt trùng sân + giờ
* Block slot khi: đã đặt hoặc đang bảo trì
* Quy định: đặt trước X ngày, hủy trước X giờ

### Pricing System
* Giá sân theo giờ
* Giá thuê thiết bị: theo giờ hoặc theo lượt
* Tính tổng tiền: sân + thiết bị thuê

### Notification System
* Booking confirmation
* Reminder trước giờ chơi
* Alert trả thiết bị
* Maintenance warning

---

## TỔNG THỂ HỆ THỐNG

| USER | ADMIN |
| :--- | :--- |
| Book Court | Manage Courts |
| Rent Equipment | Manage Bookings |
| View Booking History | Manage Inventory |
| Profile Management | Manage Maintenance |
| Notifications | Analytics |
| | Manage Users |

---

## MVP KHÁCH QUAN (Nên làm trước)
*Nếu phát triển dự án bằng **React**, đây là các tính năng cốt lõi cần ưu tiên:*

1. Auth (login/register)
2. Book sân
3. Rent thiết bị
4. Admin CRUD sân
5. Inventory cơ bản
6. Booking management
7. Check slot logic