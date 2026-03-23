const multer = require('multer');
const { AppError } = require('../utils/AppError');

// Middleware xử lý lỗi (phải đặt cuối cùng)
const errorHandler = (err, req, res, next) => {
    // nếu response đã gửi rồi thì pass cho Express
    if (res.headersSent) {
        return next(err);
    }

    // lỗi từ multer (upload)
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }

    // lỗi custom khi upload file sai định dạng
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: err.message });
    }

    // xác định status code
    const statusCode =
        err instanceof AppError ? err.statusCode : err.statusCode || 500;

    // message trả về
    const message =
        statusCode === 500 && !(err instanceof AppError)
            ? 'Internal server error'
            : err.message || 'Something went wrong';

    return res.status(statusCode).json({ message });
};

// ✅ QUAN TRỌNG: export trực tiếp function
module.exports = errorHandler;