import express from 'express';
import { checkAuth, checkRole } from '../middleware/auth.middleware.js';
import uploadCloud from '../config/cloudinary.config.js';

export function ProductRoutes(productController) {
    const router = express.Router();

    // ======= PUBLIC ROUTES =======

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


    // ======= CẦN CHECK AUTH =======

    // Xem watch list
    router.get('/watch-list', checkAuth, productController.getWatchList);


    // ======= CẦN QUYỀN SELLER =======

    // Tạo sản phẩm
    router.post('/create', 
        [
            checkAuth, 
            checkRole('seller'),
            uploadCloud.fields([
                { name: 'thumbnail', maxCount: 1 }, // Field name là 'thumbnail', tối đa 1 ảnh
                { name: 'images', maxCount: 10 }    // Field name là 'images', tối đa 10 ảnh
            ])
        ], 
        productController.createProduct
    );

    // Lấy sản phẩm của seller
    router.get('/seller', [checkAuth, checkRole('seller')], productController.getSellerProducts);


    // ======= ROUTER ĐỘNG =======

    // Ban bidder
    router.post('/:id/ban', [checkAuth, checkRole('seller')], productController.banBidder);

    // Unban bidder
    router.post('/:id/unban', [checkAuth, checkRole('seller')], productController.unbanBidder);
    
    // Lấy chi tiết sản phẩm
    router.get('/:id', productController.getProductDetails);
    
    // Lấy giá trị đặt thấp nhất
    router.get('/:id/min-price', [checkAuth, checkRole(['seller', 'bidder'])], productController.getMinValidPrice);

    // Toggle watch list
    router.post('/:id/watch-list', [checkAuth, checkRole(['seller', 'bidder'])], productController.toggleWatchList);

    // Kiểm tra xem có thích sản phẩm không
    router.get('/:id/watch-list/check', [checkAuth, checkRole(['seller', 'bidder'])], productController.checkIsWatching);

    return router;
}