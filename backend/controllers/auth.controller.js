import { authService } from "../services/auth.service.js";

// Hàm helper
const setRefreshTokenCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true, // Chống XSS, JS client không đọc được
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS
        sameSite: 'strict', // Chống CSRF
        path: '/api/auth', // Chỉ gửi cookie khi gọi các API trong path này
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
}

class AuthController {
    async sendOtp(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                throw new Error('Vui lòng cung cấp email!');
            }

            const result = await authService.sendRegisterOtp(email);

            res.status(200).json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async register(req, res) {
        try {
            // { email, password, full_name, address, otp }
            const registerData = req.body;

            const newUser = await authService.register(registerData);

            res.status(201).json({
                message: 'Đăng ký thành công!',
                data: newUser
            })
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async login(req, res) {
        try {
            const { accessToken, refreshToken } = await authService.login(req.user);

            // Gửi refresh qua cookie - access qua json
            setRefreshTokenCookie(res, refreshToken);

            res.status(200).json({token: accessToken});
        } catch (e) {
            res.status(500).json({ message: 'Lỗi máy chủ khi tạo token!' });
        }
    }

    async loginWithGoogle(req, res) {
        try {
            const { code } = req.body; // Mã ủy quyền
            console.log("Backend received Google Code:", code);
            
            if (!code) {
                return res.status(400).json({ message: 'Không có mã ủy quyền (code)!' });
            }

            const { accessToken, refreshToken } = await authService.loginWithGoogle(code);

            setRefreshTokenCookie(res, refreshToken);
            res.status(200).json({ token: accessToken });
        } catch (e) {
            console.error("GOOGLE LOGIN ERROR:", e.response?.data || e.message);
            res.status(500).json({ message: e.message || 'Lỗi đăng nhập Google!' });
        }
    }

    async loginWithFacebook(req, res) {
        try {
            const { code } = req.body;
            console.log("Backend received Facebook Code:", code);

            if (!code) {
                return res.status(400).json({ message: 'Không có mã ủy quyền (code)!' });
            }

            const { accessToken, refreshToken } = await authService.loginWithFacebook(code);

            setRefreshTokenCookie(res, refreshToken);
            res.status(200).json({ token: accessToken });
        } catch (e) {
            console.error("FACEBOOK LOGIN ERROR:", e.response?.data || e.message);
            res.status(500).json({ message: e.message || 'Lỗi đăng nhập Facebook!' });
        }
    }

    async loginWithGitHub(req, res) {
        try {
            const { code } = req.body;
            console.log("Backend received GitHub Code:", code);

            if (!code) {
                return res.status(400).json({ message: 'Không có mã ủy quyền (code)!' });
            }

            const { accessToken, refreshToken } = await authService.loginWithGitHub(code);

            setRefreshTokenCookie(res, refreshToken);
            res.status(200).json({ token: accessToken });
        } catch (e) {
            console.error("GITHUB LOGIN ERROR:", e.response?.data || e.message);
            res.status(500).json({ message: e.message || 'Lỗi đăng nhập GitHub!' });
        }
    }

    async refresh(req, res) {
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            if (!oldRefreshToken) {
                return res.status(401).json({ message: 'Không tìm thấy refresh token!' });
            }

            const { accessToken, refreshToken } = await authService.refreshToken(oldRefreshToken);

            // Refresh tokens mới
            setRefreshTokenCookie(res, refreshToken);
            res.status(200).json({ token: accessToken} );
        } catch (e) {
            res.clearCookie('refreshToken', { path: '/api/auth' });
            res.status(403).json({ message: e.message || 'Refresh token không hợp lệ!' });
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) return res.status(400).json({ message: 'Không có token để logout' });

            await authService.logout(refreshToken);

            res.clearCookie('refreshToken', { path: '/api/auth' });
            res.status(200).json({ message: 'Đăng xuất thành công' });
        } catch (e) {
            res.status(500).json({ message: e.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.user.id;

            const changed = await authService.changePassword(userId, oldPassword, newPassword);

            res.status(200).json(changed);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const result = await authService.forgotPassword(email);

            res.status(200).json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;

            const result = await authService.resetPassword(email, otp, newPassword);

            res.status(200).json(result);
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
}

export const authController = new AuthController();