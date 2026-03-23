const path = require('path');

/** Thư mục uploads ở root project (cùng cấp với thư mục src) */
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

module.exports = {
    UPLOADS_DIR
};