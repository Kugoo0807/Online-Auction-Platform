import mongoose from 'mongoose'
import { Rating } from "../../db/schema.js";

class RatingRepository {
    async create(ratingData, session = null) {
        const result = new Rating(ratingData);
        return await result.save({ session });
    }

    async findByAuctionAndRater(auctionResultId, raterId) {
        return await Rating.findOne({ 
            auction_result: auctionResultId, 
            rater: raterId 
        });
    }

    async update(ratingId, updateData, session = null) {
        return await Rating.findByIdAndUpdate(
            ratingId, 
            updateData, 
            { new: true, session }
        );
    }

    async getReviewsReceived(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await Rating.find({ rated_user: userId })
            .populate('rater', 'full_name email')
            .populate({
                path: 'auction_result',
                select: 'final_price',
                populate: { path: 'product', select: 'product_name thumbnail' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async getReviewsGiven(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await Rating.find({ rater: userId })
            .populate('rated_user', 'full_name')
            .populate({
                path: 'auction_result',
                populate: { path: 'product', select: 'product_name' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    async calculateUserStats(userId) {
        const stats = await Rating.aggregate([
            { 
                $match: { rated_user: new mongoose.Types.ObjectId(userId) } 
            },
            {
                $group: {
                    _id: null,
                    totalScore: { $sum: "$rating_type" },
                    totalCount: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            return {
                score: stats[0].totalScore,
                count: stats[0].totalCount
            };
        }
        
        return { score: 0, count: 0 };
    }
}

export const ratingRepository = new RatingRepository();