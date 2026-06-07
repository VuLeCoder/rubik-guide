# Rubik Guide 🧩

Một nền tảng mô phỏng và học giải Rubik tương tác, hiệu năng cao. Được xây dựng với **Next.js 16.2.2 (App Router)** và **React Three Fiber**, ứng dụng này mang lại trải nghiệm tốt cho những người chơi Rubik ở mọi cấp độ.

## ✨ Tính năng nổi bật

### 🎮 Trình mô phỏng 3D (Simulator)
- **Rubik:** Thao tác xoay khối Rubik 3D mượt mà và chân thực bằng chuột hoặc cảm ứng.
- **Điều khiển bằng cử chỉ:** Xoay các mặt một cách trực quan bằng cách kéo trực tiếp các ô nhỏ (cubies).
- **Lịch sử di chuyển:** Theo dõi các bước xoay của bạn với nhật ký lịch sử chi tiết.
- **Hệ thống hàng đợi (Queue):** Xử lý hàng đợi lệnh, giới hạn thao tác giúp web đỡ giật lag.

### 📚 Học giải rubik (Learn)
- **Hướng dẫn từng bước:** Các bài học toàn diện cho người mới bắt đầu.
- **Theo dõi tiến độ:** Thanh tiến trình trực quan giúp bạn nắm bắt lộ trình học tập.
- **Hình ảnh minh họa:** Các sơ đồ chất lượng cao và trình xem 3D cho các bước giải.

### ⏱️ Bộ bấm giờ (Timer)
- **Logic độ chính xác cao:** Sử dụng `Date.now()` để đo thời gian chính xác đến từng miligiây.
- **Tối ưu cho di động:** Vùng kích hoạt chạm lớn ở trung tâm, được thiết kế riêng cho việc tập luyện speedcubing chuyên nghiệp.
- **Lưu trữ lịch sử:** Tự động lưu lịch sử các lần giải vào `localStorage`.
- **Thống kê phiên chơi:** Theo dõi hiệu suất của bạn theo thời gian.

### 🚀 Hiệu suất & Tối ưu hóa
- **Tinh chỉnh R3F:** Tối ưu hóa để đạt 60FPS ổn định bằng cách sử dụng `AdaptiveDpr` và `AdaptiveEvents`.
- **Tiết kiệm GPU:** Giới hạn độ phân giải bóng đổ (shadow) và bỏ qua khung hình cho các thiết bị cấu hình thấp.
- **Không SSR cho 3D:** Các thành phần 3D được tải động để đảm bảo tốc độ tải trang ban đầu nhanh nhất.

## 🛠️ Công nghệ sử dụng

- **Framework:** [Next.js 16.2.2](https://nextjs.org/) (App Router, React 19)
- **Đồ họa 3D:** [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Components:** [Radix UI](https://www.radix-ui.com/) & [Swiper](https://swiperjs.com/)

## 🚀 Cài đặt dự án

### Yêu cầu hệ thống
- Node.js 20 trở lên
- npm / yarn / pnpm

### Cài đặt

1. Clone repository:
   ```bash
   git clone https://github.com/VuLeCoder/rubik-guide.git
   cd rubik-guide
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Chạy server:
   ```bash
   npm run dev
   ```

4. Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt của bạn.

## 📁 Cấu trúc dự án

```text
app/
├── components/          
│   ├── simulator/       # Logic & component cho khối Rubik 3D
│   ├── learn/           # Hướng dẫn các bước giải
│   ├── about-me/        # Phần giới thiệu bản thân
│   └── Timer.tsx        # Logic & giao diện bộ bấm giờ
├── globals.css          # Styles toàn cục & Tailwind
├── layout.tsx           # Layout gốc
└── page.tsx             # Điểm vào chính với điều hướng Tab
public/                  # Tài nguyên tĩnh (hình ảnh, icon)
```

## ⚙️ Cấu hình

Các hằng số quan trọng cho trình mô phỏng và hiệu suất có thể được tìm thấy trong `app/components/simulator/constants.ts`:

- `DRAG_SENSITIVITY`: Điều chỉnh độ nhạy khi kéo các ô Rubik.
- `LAYER_THRESHOLD`: Độ nhạy để xác định lớp nào sẽ xoay.
- `RUBIK_CONFIG.SCENE.SHADOW_FRAMES`: Kiểm soát tần suất cập nhật bóng đổ để tối ưu hiệu suất.


Các bước giải và công thức nằm trong `app/components/learn/constants.ts`

Các thông tin cho tab `About Me` có thể được thay đổi trong `app/components/about-me/constants.ts`
