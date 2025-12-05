import { ratingService } from '../services/rating.service.js';

class RatingController {
    async createRating(req, res) {
        try {
            const { rated_user, auction_result, rating_type, comment } = req.body;
            const rater = req.user._id; // Từ auth middleware
            const data = {
                rater,
                rated_user,
                auction_result,
                rating_type, 
                comment,
            };

            const result = await ratingService.addRating(data);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getReviewsGiven(req, res) {
        try {
            const userId = req.params.userId;
            const reviews = await ratingService.getReviewsGiven(userId);
            return res.status(200).json({
                message: 'Lấy danh sách đánh giá đã cho thành công!',
                data: reviews
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getReviewsReceived(req, res) {
        try {
            const userId = req.params.userId;
            const reviews = await ratingService.getReviewsReceived(userId);
            return res.status(200).json({
                message: 'Lấy danh sách đánh giá đã nhận thành công!',
                data: reviews
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const ratingController = new RatingController();