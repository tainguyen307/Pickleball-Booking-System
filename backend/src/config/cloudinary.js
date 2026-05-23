// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import "dotenv/config";

// 1. Cấu hình xác thực tài khoản với Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Thiết lập cấu hình bộ lưu trữ Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "PickleballPro_Media", // Tên thư mục gốc lấp lánh trên Cloudinary của bạn
        allowed_formats: ["jpg", "jpeg", "png", "webp"], // Chỉ cho phép định dạng ảnh sạch
        transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }] // Tự động nén tối ưu dung lượng ảnh sản phẩm
    }
});

const uploadCloud = multer({ storage });

export { cloudinary, uploadCloud };