import mongoose from 'mongoose';
import { ratingRepository } from '../repositories/rating.repository.js';
import { userRepository } from '../repositories/user.repository.js';

class RatingService {

    async addRating(data, externalSession = null) {
        const session = externalSession || await mongoose.startSession();
        if (!externalSession) session.startTransaction();

        try {
            const { rater, rated_user, auction_result, rating_type, comment } = data;

            const existing = await ratingRepository.findByAuctionAndRater(auction_result, rater);
            if (existing) {
                throw new Error('Bạn đã đánh giá giao dịch này rồi!');
            }

            // Validate trạng thái đơn hàng
            const order = await auctionResultRepository.findById(auction_result);
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
            const newStats = await ratingRepository.calculateUserStats(rated_user);

            // Cập nhật vào bảng User
            await userRepository.updateRatingStats(
                rated_user, 
                newStats.score, 
                newStats.count, 
                session
            );

            if (!externalSession) await session.commitTransaction();
            return { message: 'Đánh giá thành công!' };

        } catch (error) {
            if (!externalSession) await session.abortTransaction();
            throw error;
        } finally {
            if (!externalSession) session.endSession();
        }
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