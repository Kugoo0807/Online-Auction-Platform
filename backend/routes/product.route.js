import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';

export function ProductRoutes(productController) {
    const router = express.Router();

    // Tìm kiếm
    router.get('/search', productController.searchProducts);

    // Lấy top 5 sản phẩm (trang HOME)
    router.get('/top-ending', productController.getTop5EndingSoon);
    router.get('/top-price', productController.getTop5HighestPrice);
    router.get('/top-bidded', productController.getTop5MostBidded);

    // Lấy danh sách theo danh mục (Có phân trang)
    router.get('/category/:slug', productController.getProductsByCategory); 

    // Lấy ngẫu nhiên 5 sản phẩm từ 1 danh mục
    router.get('/category/:slug/random', productController.getRandom5ProductsByCategory);

    // Tạo sản phẩm
    router.post('/create', [checkAuth, checkRole('seller')], productController.createProduct);

    // Lấy sản phẩm của seller
    router.get('/seller', [checkAuth, checkRole('seller')], productController.getSellerProducts);
    
    // Lấy chi tiết sản phẩm
    router.get('/:id', productController.getProductDetails);

    return router;
}