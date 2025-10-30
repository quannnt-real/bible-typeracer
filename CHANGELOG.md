# Cập nhật hệ thống - Typing Racing Game

## Các thay đổi đã thực hiện

### 1. Bỏ phần "Bắt đầu với văn bản ngẫu nhiên"
- Đã xóa button "Bắt đầu với văn bản ngẫu nhiên" và dòng "hoặc" ở trang chủ
- Người dùng giờ chỉ có thể chọn đoạn Kinh Thánh cụ thể thông qua BibleSelector

### 2. Hệ thống Rankings với SQLite
- Tạo database SQLite riêng: `server/db/rankings.sqlite`
- Migration file: `server/migrations/04-rankings.sql`
- Utility functions: `server/utils/rankings-db.ts`
- API đã được cập nhật để sử dụng SQLite thay vì Postgres:
  - `GET /api/rankings` - Lấy top rankings
  - `POST /api/rankings/new` - Thêm ranking mới

### 3. Hệ thống Lịch sử gõ (Typing History)
- Tạo database SQLite riêng: `server/db/typing-history.sqlite`
- Migration file: `server/migrations/05-typing-history.sql`
- Utility functions: `server/utils/typing-history-db.ts`

#### Các API endpoints mới:
- `POST /api/typing-history/check` - Kiểm tra đoạn văn đã gõ bao nhiêu lần
- `POST /api/typing-history/record` - Lưu lịch sử gõ
- `GET /api/typing-history/recent` - Lấy lịch sử gõ gần đây
- `GET /api/typing-history/stats` - Lấy thống kê lịch sử gõ

### 4. Trang Lịch sử mới
- Trang mới: `/history`
- Hiển thị thống kê:
  - Tổng số đoạn đã gõ
  - Tổng số lần gõ
  - Đoạn gõ nhiều nhất
- Bảng lịch sử gõ gần đây với thông tin chi tiết

### 5. Thông báo khi chọn đoạn đã gõ
- Khi chọn đoạn Kinh Thánh để gõ, hệ thống sẽ kiểm tra xem đã gõ bao nhiêu lần
- Hiển thị thông báo: "Bạn đã gõ đoạn này X lần rồi. Bạn có muốn tiếp tục không?"
- Người dùng có thể chọn tiếp tục hoặc hủy

### 6. Tự động lưu lịch sử
- Khi hoàn thành gõ một đoạn văn, hệ thống tự động:
  - Lưu ranking vào database rankings
  - Lưu/cập nhật lịch sử gõ vào database typing-history
  - Tăng số lần gõ nếu đoạn văn đã từng được gõ trước đó

## Cấu trúc Database

### Rankings Database (`rankings.sqlite`)
```sql
CREATE TABLE rankings (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  score_wpm INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Typing History Database (`typing-history.sqlite`)
```sql
CREATE TABLE typing_history (
  id TEXT PRIMARY KEY,
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER,
  verse_end INTEGER,
  text_content TEXT NOT NULL,
  times_typed INTEGER DEFAULT 1,
  last_typed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Cách sử dụng

1. Khởi động server:
```bash
npm run dev
```

2. Database sẽ được tự động tạo khi chạy lần đầu tiên

3. Các trang có sẵn:
   - `/` - Trang chủ (chơi game)
   - `/ranking` - Bảng xếp hạng
   - `/history` - Lịch sử gõ của bạn

## Notes

- Tất cả database SQLite sẽ được lưu trong thư mục `server/db/`
- Migration files được lưu trong `server/migrations/`
- Database sẽ tự động được khởi tạo nếu chưa tồn tại
- Lịch sử gõ sẽ tự động cập nhật số lần gõ nếu gõ lại đoạn văn cũ
