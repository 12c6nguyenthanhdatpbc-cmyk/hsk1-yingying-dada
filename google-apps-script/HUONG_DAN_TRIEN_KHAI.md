# Hướng dẫn triển khai GitHub Pages + Google Sheets (Tiếng Trung YingYing DaDa)

Chỉ cần thiết lập **1 lần duy nhất** (khoảng 5–10 phút). Từ sau, bạn sửa từ vựng/bài tập ngay trên **Google Sheets** và xem điểm học viên tự động đổ về tab **KetQua** mà không cần đụng lại vào code hay xuất lại Google Sites.

## Bước 1: Tạo kho dữ liệu Google Sheets
1. Tải file `HSK1_YingYingDaDa_Database.xlsx` lên **Google Drive**.
2. Mở file đó bằng **Google Trang tính (Google Sheets)** → chọn **Tệp (File) → Lưu dưới dạng Google Trang tính (Save as Google Sheets)**.
3. File đã có sẵn 4 tab chuẩn: `BaiHoc` (15 bài), `TuVung` (330 từ), `BaiTap` (346 câu), `KetQua` (bảng điểm học viên).

## Bước 2: Gắn cầu nối Google Apps Script
1. Trong file Google Sheets vừa lưu, chọn **Tiện ích mở rộng (Extensions) → Apps Script**.
2. Xóa code mặc định, dán toàn bộ nội dung trong file `google-apps-script/Code.gs` và nhấn **Lưu (Ctrl+S)**.
3. Nhấn **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)** → chọn loại **Ứng dụng web (Web app)**:
   - **Thực thi dưới tư cách (Execute as):** Tôi (*Me*)
   - **Người có quyền truy cập (Who has access):** Bất kỳ ai (*Anyone*)
4. Nhấn **Triển khai**, cấp quyền cho tài khoản Google của bạn, rồi sao chép đường link Web App có dạng:
   `https://script.google.com/macros/s/AKfycb.../exec`

## Bước 3: Kết nối link Apps Script với Website (GitHub Pages)
- **Cách nhanh (thử ngay):** Mở website → vào mục **Quản trị giáo viên** → dán link Web App vào ô **Link Google Apps Script** → nhấn **Lưu & Đồng bộ ngay**.
- **Cách cố định cho tất cả học viên (dùng lâu dài trên GitHub Pages):**
  1. Đẩy thư mục mã nguồn lên 1 repository GitHub (ví dụ `hsk1-yingying-dada`), bật **Settings → Pages → Source: GitHub Actions**.
  2. Mở file `src/services/sheetsSyncService.ts` (hoặc dòng `DEFAULT_GAS_WEBAPP_URL` trong file HTML), dán link Web App vào dấu nháy đơn rồi **Commit changes**.
  3. Nếu muốn đưa lên **Google Sites**, chỉ cần chèn **Nhúng (Embed) → Theo URL** và dán link GitHub Pages **1 lần duy nhất**!
