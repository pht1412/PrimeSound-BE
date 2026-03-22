const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
        cb(null, file.fieldname + '-' + baseName + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    console.log(`Kiểm tra file - Field: ${file.fieldname}, MimeType: ${file.mimetype}, Tên gốc: ${file.originalname}`);

    if (file.fieldname === "audio") {
        if (!file.mimetype.startsWith('audio/')) {
            return cb(new Error('Only audio files are allowed!'));
        }
    } else if (file.fieldname === "cover") {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'));
        }
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});

module.exports = upload;

