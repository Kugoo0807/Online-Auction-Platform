import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function AdminRoutes() {
    const router = express.Router();

    router.get(
        '/health',
        [checkAuth, checkRole("admin")],
        (req, res) => {
            req.user.password = undefined;
            res.status(200).json({
                status: "Admin API đang chạy tốt!",
                user: req.user
            });
        }
    );

    return router;
}