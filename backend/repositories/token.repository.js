import { RefreshToken } from '../../db/schema.js';

class TokenRepository {
    async saveRefreshToken(userId, refreshToken, expiry) {
        const token = new RefreshToken({
                user_id: userId,
                token: refreshToken,
                expires_at: expiry
            });
        await token.save();
        return token;
    }

    async findRefreshToken(refreshToken) {
        return await RefreshToken.findOne({ token: refreshToken, is_revoked: false });
    }
    
    async deleteRefreshToken(refreshToken) {
        return await RefreshToken.findOneAndUpdate(
            { token: refreshToken },
            { is_revoked: true },             
            { new: true }
        );
    }
}

export const tokenRepository = new TokenRepository();