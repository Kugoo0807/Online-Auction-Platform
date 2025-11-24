import { RefreshToken } from '../../db/schema.js';

class TokenRepository {
    async saveRefreshToken(userId, refreshToken, expiry) {
        try {
            const token = new RefreshToken({
                user_id: userId,
                token: refreshToken,
                expires_at: expiry
            });
            await token.save();
            return token;
        } catch (error) {
            throw error;
        }
    }

    async findRefreshToken(refreshToken) {
        try {
            return await RefreshToken.findOne({ token: refreshToken, is_revoked: false });
        } catch (error) {
            throw error;
        }
    }
    
    async deleteRefreshToken(refreshToken) {
        try {
            return await RefreshToken.findOneAndUpdate(
                { token: refreshToken },
                { is_revoked: true },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }
}

export const tokenRepository = new TokenRepository();