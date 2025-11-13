const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware.js');


router.get(
    '/health',
    [verifyToken, isAdmin], // 2 middlewares
    (req, res) => {
        res.status(200).json({ 
            status: "Admin API đang chạy tốt!",
            user: req.user
        });
    }
);

module.exports = router;