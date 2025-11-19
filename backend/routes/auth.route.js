import express from 'express';
import { attemptLogin, checkAuth } from '../middleware/auth.middleware.js';
import passport from 'passport';

export function AuthRoutes(authController) {
    const router = express.Router();

    // Đăng ký (input: email, password, full_name, address, phone_number)
    router.post("/register", authController.register);
    
    // Đăng nhập (input: email, password)
    router.post("/login", [attemptLogin], authController.login);
    
    // Refresh lại token (Cookies cần có refreshToken)
    router.post("/refresh", authController.refresh);
    
    // Logout (Cần có accessToken để xác định để đăng nhập)
    router.post("/logout", authController.logout);
    
    // Đăng nhập bằng google
    router.post("/google/login", authController.loginWithGoogle);
    
    // Hàm test get me (kiểm tra đăng nhập)
    router.get('/me', [checkAuth], (req, res) => {
        req.user.password = undefined;
        res.json({
            user: req.user
        })
    });

    return router;
}