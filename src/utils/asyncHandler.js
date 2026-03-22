/**
 * Bọc async handler để lỗi được chuyển tới error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
