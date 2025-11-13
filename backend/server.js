const express = require('express');
const simpleLogger = require('./middleware/logger.middleware.js');
const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const productRoutes = require('./routes/product.route.js');
const authRoutes = require('./routes/auth.route.js');
const adminRoutes = require('./routes/admin.route.js');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(simpleLogger);

app.get('/api', (req, res) => {
    res.send('Chào mừng đến với API Sàn Đấu Giá!');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: "API Sàn Đấu Giá đang chạy tốt!" });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// START
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng http://localhost:${PORT}/api`);
});