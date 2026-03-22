import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(decoded._id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export const generateToken = (userId, role) => {
    return jwt.sign(
        { _id: userId, role: role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};
