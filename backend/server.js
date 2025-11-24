import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from '../db/connect.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import './config/passport.config.js';
import simpleLogger from './middleware/logger.middleware.js';

await connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(simpleLogger);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Import routes
const { authController } = await import('./controllers/auth.controller.js');
const { AuthRoutes } = await import('./routes/auth.route.js');
const { AdminRoutes } = await import('./routes/admin.route.js');
const { productController } = await import('./controllers/product.controller.js');
const { ProductRoutes } = await import('./routes/product.route.js');

app.get('/api', (req, res) => {
    res.send('Chào mừng đến với API Sàn Đấu Giá!');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "API Sàn Đấu Giá đang chạy tốt!" });
});

app.use('/api/auth', AuthRoutes(authController));
app.use('/api/products', ProductRoutes(productController));
app.use('/api/admin', AdminRoutes());

// START
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}/api`);
});