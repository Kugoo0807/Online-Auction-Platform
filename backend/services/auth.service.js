import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { userRepository } from '../repositories/user.repository.js';
import { tokenRepository } from '../repositories/token.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';

import { sendOtp } from './email.service.js';

import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'google_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'google_secret';

const googleClient = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:5173/oauth/callback'
);

class AuthService {
    async sendRegisterOtp(email) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email đã tồn tại trong hệ thống!');
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        await otpRepository.createOrUpdateOtp(email, hashedOtp);

        console.log(`[REGISTER OTP] Gửi tới ${email}: ${otp}`);
        // TODO: mail service

        return { message: 'OTP xác thực đã được gửi tới email của bạn.' };
    }

    async register(registerData) {
        const { email, password, full_name, address, otp } = registerData;

        // Validate đầu vào
        if (!otp) throw new Error('Vui lòng nhập mã OTP!');

        // Check OTP
        const otpRecord = await otpRepository.findByEmail(email);
        
        if (!otpRecord) {
            throw new Error('OTP không tồn tại hoặc đã hết hạn!');
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            throw new Error('Mã OTP không chính xác!');
        }

        // Check tồn tại user
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email đã tồn tại!');
        }

        // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userRepository.create({
            email: email,
            password: hashedPassword,
            full_name: full_name,
            address: address,
            role: 'bidder' // Mặc định
        });

        // Dọn dẹp OTP
        await otpRepository.deleteByEmail(email);

        // Ẩn mật khẩu
        newUser.password = undefined;
        return newUser;
    }

    async login(user) {
        // user ở đây là user đã được xác thực bởi Passport
        
        return this.generateToken(user);
    }

    async loginWithGoogle(code) {
        const { tokens } = await googleClient.getToken(code);
        const idToken = tokens.id_token;

        if (!idToken) {
            throw new Error('Không thể lấy ID Token từ Google!');
        }

        // Lấy thông tin user
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const googleProfile = {
            email: payload.email,
            full_name: payload.name,
            auth_provider: 'google',
            provider_id: payload.sub, // ID duy nhất của Google
        };

        let user = await userRepository.findByProviderId(
            googleProfile.auth_provider,
            googleProfile.provider_id
        );

        if (!user) {
            // Kiểm tra xem mail có tồn tại không
            const existingUser = await userRepository.findByEmail(googleProfile.email);
            if (!existingUser) {
                // Tạo mới
                user = await userRepository.createSocialUser(googleProfile);
            }
            else {
                // Kiểm tra xem tài khoản có liên kết với nhà cung cấp khác không
                if (existingUser.auth_provider !== 'local') {
                    throw new Error('Email này đã liên kết với nhà cung cấp khác!');
                }

                await userRepository.linkSocialAccount(
                    existingUser.id,
                    googleProfile.auth_provider,
                    googleProfile.provider_id
                )
                user = existingUser;
            }
        }

        return this.generateToken(user);
    }

    async generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        
        // Ký access token (15 phút)
        const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        
        // Ký refresh token (7 ngày)
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const refreshToken = jwt.sign(
            { id: user.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )

        // Lưu refresh token
        await tokenRepository.saveRefreshToken(user.id, refreshToken, expiry);

        return {
            accessToken: 'Bearer ' + accessToken,
            refreshToken: refreshToken
        }
    }

    async refreshToken(oldRefreshToken) {
        const tokenDB = await tokenRepository.findRefreshToken(oldRefreshToken);
        if (!tokenDB) {
            throw new Error('Refresh Token không hợp lệ hoặc hết hạn!');
        }

        // Xác thực chữ ký
        let payload;
        try {
            payload = jwt.verify(oldRefreshToken, REFRESH_TOKEN_SECRET);
        } catch (e) {
            await tokenRepository.deleteRefreshToken(oldRefreshToken);
            throw new Error('Refresh Token không hợp lệ!');
        }

        const user = await userRepository.findById(payload.id);
        if (!user) {
            throw new Error('Không tìm thấy người dùng ứng với Token!');
        }

        // Xóa Refresh Token cũ và tạo Tokens mới
        await tokenRepository.deleteRefreshToken(oldRefreshToken);

        return await this.generateToken(user);
    }

    async logout(refreshToken) {
        await tokenRepository.deleteRefreshToken(refreshToken);
        return { message: 'Đăng xuất thành công.' };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Không tìm thấy người dùng!');
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Mật khẩu cũ không chính xác!');
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(userId, newHashedPassword);
        return { message: 'Đổi mật khẩu thành công!' };
    }

    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại trong hệ thống!');
        }
        if (user) {
            try {
                // Tạo OTP (6 số) và hash OTP trước khi đưa cho Database
                const otp = crypto.randomInt(100000, 999999).toString();
                const salt = await bcrypt.genSalt(10);
                const hashedOtp = await bcrypt.hash(otp, salt);

                // Đặt thời gian hết hạn (10 phút)
                const expiry = new Date(Date.now() + 10 * 60 * 1000);

                // Lưu OTP
                await otpRepository.createOrUpdateOtp(email, hashedOtp);

                // Gửi OTP (chưa hash) cho người dùng
                //await emailService.sendOtp(email, otp);
                console.log('[FORGOT PASSWORD OTP]: ' + otp);
            } catch (e) {
                throw new Error('Lỗi khi xử lý forgotPassword: ' + e);
            }
        }

        return { message: 'OTP đang được gửi đi...' };
    }
    
    async resetPassword(email, otp, newPassword) {
        const otpRecord = await otpRepository.findByEmail(email);

       // Kiểm tra OTP có tồn tại không
        if (!otpRecord) {
            throw new Error('Mã OTP không tồn tại hoặc đã hết hạn!');
        }

        // So sánh mã OTP (hash)
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            throw new Error('Mã OTP không chính xác!');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        await userRepository.updatePassword(user.id, newHashedPassword);

        // Xóa OTP
        await userRepository.clearOtp(user.id);

        return { message: 'Mật khẩu đã được reset thành công.' };
    }
}

export const authService = new AuthService();