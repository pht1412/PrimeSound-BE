/**
 * Lỗi nghiệp vụ có mã HTTP — Service ném, error middleware trả JSON.
 */
class AppError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

module.exports = { AppError };
