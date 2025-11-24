import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function ProductRoutes(productController) {
    const router = express.Router();

    // Lấy top 5 sản phẩm gần kết thúc
    router.get('/top-ending', productController.getTop5EndingSoon);

    // Lấy top 5 sản phẩm giá cao nhất
    router.get('/top-price', productController.getTop5HighestPrice);

    // lấy top 5 sản phẩm được bid nhiều nhất
    router.get('/top-bidded', productController.getTop5MostBidded);

    // Tạo sản phẩm
    router.post('/create', [checkAuth, checkRole('seller')], productController.createProduct);
    
    // Lấy chi tiết sản phẩm
    router.get('/:id', productController.getProductDetails);

    return router;
}