import multer from 'multer';
import { AppError } from '../utils/AppError.js';

/**
 * Phải đăng ký sau mọi route: app.use(errorHandler)
 */
export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }

    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: err.message });
    }

    const statusCode =
        err instanceof AppError ? err.statusCode : err.statusCode || 500;
    const message =
        statusCode === 500 && !(err instanceof AppError)
            ? 'Internal server error'
            : err.message || 'Something went wrong';

    res.status(statusCode).json({ message });
};
