import express from 'express';
import { checkAuth, checkRole, checkNotAdmin } from '../middleware/auth.middleware.js';

export function QnARoutes(qnaController) {
    const router = express.Router();

    router.get('/product/:productId', qnaController.listByProduct);
    router.post('/ask', [checkAuth, checkNotAdmin], qnaController.askQuestion);
    router.post('/:qnaId', [checkAuth, checkRole('seller')], qnaController.answerQuestion);

    return router;
}