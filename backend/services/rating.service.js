import mongoose from 'mongoose';
import { ratingRepository } from '../repositories/rating.repository.js';
import { userRepository } from '../repositories/user.repository.js';

class RatingService {

    async addRating(data, externalSession = null) {
        const session = externalSession || await mongoose.startSession();
        if (!externalSession) session.startTransaction();

        try {
            const { rater, rated_user, auction_result, rating_type } = data;

            const existing = await ratingRepository.findByAuctionAndRater(auction_result, rater);
            if (existing) {
                throw new Error('Bạn đã đánh giá giao dịch này rồi!');
            }

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
}

export const ratingService = new RatingService();