import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter.js';
import usersRouter from './routes/usersRouter.js';
import { UPLOADS_DIR } from './config/paths.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);

app.use(errorHandler);

export default app;
