import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function RatingRoutes(ratingController) {
    const router = express.Router();

    router.post('/', [checkAuth, checkNotAdmin], ratingController.createRating);

    router.get('/given', [checkAuth, checkNotAdmin], ratingController.getReviewsGiven);
    
    router.get('/received', [checkAuth, checkNotAdmin], ratingController.getReviewsReceived);

    router.put('/:ratingId/type', [checkAuth, checkNotAdmin], ratingController.changeRatingType);

    return router;
}