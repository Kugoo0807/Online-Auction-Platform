import express from 'express';
import { checkAuth, checkNotAdmin } from '../middleware/auth.middleware.js';

export function QnARoutes(qnaController) {
    const router = express.Router();

    router.get('/product/:productId', qnaController.listByProduct);
    router.post('/ask', [checkAuth, checkNotAdmin], qnaController.askQuestion);
    router.post('/:qnaId', [checkAuth, checkNotAdmin], qnaController.answerQuestion);

    return router;
}