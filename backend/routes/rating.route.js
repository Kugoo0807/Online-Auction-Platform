import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function RatingRoutes(ratingController) {
    const router = express.Router();

    router.post('/', [checkAuth, checkNotAdmin], ratingController.createRating);
    router.get('/given/:userId', ratingController.getReviewsGiven);
    router.get('/received/:userId', ratingController.getReviewsReceived);

    return router;
}