import jwt from 'jsonwebtoken';

export const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const generateToken = (userId, role) => {
    return jwt.sign({ _id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
};
