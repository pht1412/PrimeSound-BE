# Sử dụng Node.js phiên bản Alpine cho nhẹ (tiết kiệm tài nguyên)
FROM node:20-alpine

# Tạo thư mục làm việc bên trong container
WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng Docker Cache
COPY package*.json ./

# Cài đặt các thư viện (chỉ cài dependencies cần thiết cho chạy production)
RUN npm install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Thiết lập các biến môi trường mặc định
# Bạn đã chọn cổng 5000 để khớp với Frontend
ENV PORT=5000
ENV MONGO_URI=mongodb://localhost:27017/primesound

# Mở cổng 5000 cho traffic bên ngoài
EXPOSE 5000

# Lệnh khởi động server
CMD ["npm", "start"]
