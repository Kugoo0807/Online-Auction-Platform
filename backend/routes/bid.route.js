import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function BidRoutes(bidController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======

    // === ROUTER ĐỘNG ===
    // API Xem lịch sử (Public)
    router.get('/:id/history', bidController.getBidHistory);


    // ======= CẦN QUYỀN BIDDER =======


    // === ROUTER ĐỘNG ===
    // API Ra giá (Cần login + quyền bidder)
    router.post('/:id/place', [checkAuth, checkRole(['bidder', 'seller'])], bidController.placeBid);

    return router;
}