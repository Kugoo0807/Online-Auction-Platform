import mongoose from 'mongoose';
import { ratingRepository } from '../repositories/rating.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { executeTransaction } from '../../db/db.helper.js';
class RatingService {
    async _addRatingLogic(data, session) {
        const { rater, rated_user, auction_result, rating_type } = data;

        const existing = await ratingRepository.findByAuctionAndRater(auction_result, rater, session);
        if (existing) {
            throw new Error('Bạn đã đánh giá giao dịch này rồi!');
        }

        // Validate trạng thái đơn hàng
        const order = await auctionResultRepository.findById(auction_result, session);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại!');
        }

        // Chỉ cho phép đánh giá khi đơn hàng đã hoàn tất hoặc bị hủy
        const allowedStatus = ['completed', 'cancelled'];
        if (!allowedStatus.includes(order.status)) {
            throw new Error('Giao dịch chưa hoàn tất (hoặc chưa bị hủy), không thể đánh giá lúc này!');
        }

        // Tạo rating
        await ratingRepository.create(data, session);

        // Tính toán lại chỉ số rating
        const newStats = await ratingRepository.calculateUserStats(rated_user, session);

        // Cập nhật vào bảng User
        await userRepository.updateRatingStats(
            rated_user, 
            newStats.score, 
            newStats.count, 
            session
        );
        // Gửi email thông báo cho người được đánh giá
        return { message: 'Đánh giá thành công!' };
    }

    async addRating(data, externalSession = null) {
        if (externalSession) {
            return await this._addRatingLogic(data, externalSession);
        }

        return await executeTransaction(async (newSession) => {
            return await this._addRatingLogic(data, newSession);
        });
    }



    async getReviewsGiven(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }
        return await ratingRepository.getReviewsGiven(userId);
    }

    async getReviewsReceived(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('Người dùng không tồn tại!');
        }
        return await ratingRepository.getReviewsReceived(userId);
    }
}

export const ratingService = new RatingService();