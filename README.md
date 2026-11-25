# Tiếng Trung YingYing DaDa – Nền tảng học tiếng Trung HSK cho người Việt

Nền tảng E-learning dạy và học tiếng Trung tương tác xây dựng bằng **React + TypeScript + Vite**, tách dữ liệu hoàn toàn bằng **JSON**, sẵn sàng mở rộng tập trung chuyên sâu vào **New HSK 1 (HSK 3.0)** và triển khai miễn phí trên **GitHub Pages**.

## 1. Cấu trúc thư mục
```
chinese-learning-platform/
├── .github/workflows/deploy.yml   # Tự động triển khai GitHub Pages khi push
├── public/
│   ├── images/                    # Ảnh minh họa khóa học & bài học
│   └── audio/                     # Nơi đặt file âm thanh .mp3 thu âm chuẩn
├── src/
│   ├── data/
│   │   ├── courses.json           # Danh sách cấp độ New HSK 1 (HSK 3.0)
│   │   ├── listening.json         # Ngân hàng bài luyện nghe độc lập
│   │   ├── lesson-schema-template.json  # Mẫu JSON chuẩn cho giáo viên
│   │   └── hsk1/                  # Bài 1, 2, 3 HSK1 (có thể thêm hsk2/...hsk9/)
│   ├── services/                  # LocalStorage & Audio/TTS fallback
│   ├── types/                     # Định nghĩa TypeScript chuẩn
│   ├── utils/                     # Bộ chấm điểm 12 dạng bài tập
│   └── App.tsx
├── vite.config.ts                 # Đã cấu hình base: './' cho subpath GitHub Pages
└── package.json
```

## 2. Hướng dẫn chạy thử trên máy tính (dành cho người mới)
1. Cài đặt **Node.js (bản LTS)** từ trang chủ `https://nodejs.org/`.
2. Giải nén thư mục dự án, mở **Terminal / Command Prompt** tại thư mục dự án và chạy:
   ```bash
   npm install
   npm run dev
   ```
3. Mở đường dẫn hiển thị (thường là `http://localhost:5173`) trên trình duyệt.

## 3. Hướng dẫn đưa website lên GitHub Pages (Miễn phí)
1. Tạo một repository mới trên GitHub (ví dụ `hanlin-chinese`).
2. Đẩy toàn bộ mã nguồn lên nhánh `main`:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao nen tang hoc tieng Trung HSK"
   git branch -M main
   git remote add origin https://github.com/<ten-tai-khoan>/hanlin-chinese.git
   git push -u origin main
   ```
3. Trên GitHub, vào **Settings → Pages → Source**, chọn **GitHub Actions**.
4. Chờ 1–2 phút, website của bạn sẽ tự động hoạt động tại `https://<ten-tai-khoan>.github.io/hanlin-chinese/`.

## 4. Cách giáo viên thêm bài học mới (New HSK 1 (HSK 3.0))
- Mở tab **Giáo viên** ngay trên website để soạn bài bằng biểu mẫu hoặc chỉnh sửa JSON, sau đó bấm **Xuất file JSON**.
- Hoặc sao chép `src/data/lesson-schema-template.json` thành `src/data/hsk2/lesson-01.json`, đăng ký trong `src/data/index.ts` và thêm file `.mp3` vào `public/audio/`.
