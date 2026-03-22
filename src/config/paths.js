import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Thư mục uploads ở root project (cùng cấp với thư mục src) */
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');
