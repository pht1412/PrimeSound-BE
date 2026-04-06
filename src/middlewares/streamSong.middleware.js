// src/middlewares/streamSong.middleware.js
const fs = require('fs');
const path = require('path');
const songService = require('../services/song.service');

/**
 * Middleware xử lý streaming nhạc với hỗ trợ HTTP Range Request
 * 
 * Quy trình:
 * 1. Lấy đường dẫn file từ service (kèm kiểm tra access)
 * 2. Xử lý Range header (nếu có) hoặc toàn bộ file
 * 3. Đặt HTTP headers phù hợp (200 hoặc 206)
 * 4. Stream file đến client
 */
const streamSongMiddleware = async (req, res, next) => {
    try {
        // Lấy đường dẫn file từ service (đã có kiểm tra access bên trong)
        const audioPath = await songService.getSongStreamData(req.params.id, req.user);
        
        // Lấy thông tin file
        const stat = fs.statSync(audioPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        // ===== PHẦN 1: XỬ LÝ RANGE REQUEST (HTTP 206 Partial Content) =====
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(audioPath, { start, end });
            
            // Headers cho partial content
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } 
        // ===== PHẦN 2: STREAM TOÀN BỘ FILE (HTTP 200 OK) =====
        else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            };
            
            res.writeHead(200, head);
            fs.createReadStream(audioPath).pipe(res);
        }
    } catch (error) {
        // ===== PHẦN 3: XỬ LÝ LỖI =====
        const status = (error.message === "Song not found") ? 404 : 
                       (error.message === "Unauthorized to stream this song") ? 403 : 500;
        res.status(status).json({ message: error.message });
    }
};

module.exports = streamSongMiddleware;
