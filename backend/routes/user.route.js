import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function UserRoutes(userController) {
    const router = express.Router();

    // === USER ===

    // Lấy thông tin cá nhân
    router.get('/profile', checkAuth, userController.getProfile);

    // Cập nhật thông tin cá nhân
    router.put('/profile', checkAuth, userController.updateProfile);


    // === ADMIN ===

    // Xóa người dùng
    router.delete('/:id', [checkAuth, checkRole('admin')], userController.deleteUser);

    // Khôi phục người dùng
    router.post('/:id/restore', [checkAuth, checkRole('admin')], userController.restoreUser);

    return router;
}