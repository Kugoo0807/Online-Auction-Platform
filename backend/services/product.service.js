import { productRepository } from '../repositories/product.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { executeTransaction } from '../../db/db.helper.js';
import { recalculateAuctionState } from '../utils/auction.util.js';
import { watchListRepository } from '../repositories/watch.list.repository.js';
import * as mailService from './email.service.js';
import SendmailTransport from 'nodemailer/lib/sendmail-transport/index.js';
class ProductService {
    async createProduct(productData) {
        const { description, ...restData } = productData;

        const newProductData = {
            ...restData,
            description_history: [{
                content: description || '',
                timestamp: new Date()
            }]
        };

        return await productRepository.create(newProductData);
    }

    async appendDescription(userId, productId, newContent) {
        const product = await productRepository.findById(productId);
        if (!product) throw new Error('Sản phẩm không tồn tại!');

        // Validate seller
        if (product.seller._id.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa sản phẩm này!');
        }
        
        return await productRepository.appendDescription(productId, newContent);
    }

    async findProductDetails(productId) {
        return await productRepository.findById(productId);
    }

    async findTop5ProductsEndingSoon() {
        const sortOption = { auction_end_time: 1 };
        return await productRepository.findByCondition(
            undefined, 
            {auction_status: 'active', auction_end_time: { $gt: new Date() }}, 
            sortOption, 
            5
        );
    }

    async findTop5HighestPriceProducts() {
        const sortOption = { current_highest_price : -1 };
        return await productRepository.findByCondition(
            undefined, 
            {auction_status: 'active', auction_end_time: { $gt: new Date() }}, 
            sortOption, 
            5
        );
    }

    async findTop5MostBiddedProducts() {
        const sortOption = { bid_count : -1 };
        return await productRepository.findByCondition(
            undefined, 
            {auction_status: 'active', auction_end_time: { $gt: new Date() }}, 
            sortOption, 
            5
        );
    }

    async getProductsByCategorySlug(slug) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        const allCategoryIds = await categoryRepository.getAllDescendantIds(category._id);
        const filter = { category: {$in: allCategoryIds }};

        return await productRepository.findByCondition(undefined, filter, {});
    }

    async getProductsBySellerId(seller) {
        const filter = { seller: seller };
        const sortOption = { createdAt: -1 };
        return await productRepository.findByCondition(undefined, filter, sortOption);
    }

    async searchProducts(keyword) {
        return await productRepository.findByCondition(keyword, {}, {});
    }

    async getRandom5ProductsByCategorySlug(slug) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        const allCategoryIds = await categoryRepository.getAllDescendantIds(category._id);
        const filter = { category: { $in: allCategoryIds } };

        return await productRepository.findRandom(filter, 5);
    }
    
    // Đưa vào API lấy chi tiết sản phẩm
    async getMinValidPrice(productId, userId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại!');
        }
        if (userId === product.seller._id.toString()) {
            throw new Error('Seller không thể tự đặt giá sản phẩm của mình!');
        }

        const globalFloor = product.bid_count === 0
            ? product.start_price
            : product.current_highest_price + product.bid_increment;
        
        const userFloor = product.auto_bid_map.get(userId.toString()) || 0;

        return {
            min_valid_price: Math.max(globalFloor, userFloor + product.bid_increment)
        };
    }

    async banBidder(sellerId, productId, bidderIdToBan) {
        return await executeTransaction(async (session) => {
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại");

            if (product.seller.toString() !== sellerId) {
                throw new Error("Không có quyền thực hiện");
            }

            const bannedSet = new Set(product.banned_bidder.map(id => id.toString()));
            if (!bannedSet.has(bidderIdToBan)) {
                product.banned_bidder.push(bidderIdToBan);
            } else {
                return { success: true, message: "Người dùng đã bị cấm trước đó" };
            }

            recalculateAuctionState(product);

            await productRepository.save(product, session);
            return { success: true };
        });
    }

    async unbanBidder(sellerId, productId, bidderIdToUnban) {
        return await executeTransaction(async (session) => {
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại");

            if (product.seller.toString() !== sellerId) {
                throw new Error("Không có quyền thực hiện");
            }

            // Dùng filter để loại bỏ ID
            product.banned_bidder = product.banned_bidder.filter(
                id => id.toString() !== bidderIdToUnban
            );

            recalculateAuctionState(product);

            await productRepository.save(product, session);
            return { success: true };
        });
    }
    
    async toggleWatchList(userId, productId) {
        const product = await productRepository.findById(productId);    
        if (!product) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Validate seller
        if (product.seller._id.toString() === userId.toString()) {
            throw new Error('Bạn không thể tự thêm sản phẩm của mình vào yêu thích!')
        }
        
        const isExist = await watchListRepository.exists(userId, productId);
        if (isExist) {
            await watchListRepository.remove(userId, productId);
            return { 
                action: 'removed', 
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích' 
            };
        } else {
            await watchListRepository.add(userId, productId);
            return { 
                action: 'added', 
                message: 'Đã thêm sản phẩm vào danh sách yêu thích' 
            };
        }
    }

    async getWatchList(userId) {
        const list = await watchListRepository.getByUserId(userId);
        return list;
    }

    async checkIsWatching(userId, productId) {
        const isWatching = await watchListRepository.exists(userId, productId);
        return isWatching;
    }

    async cancelProduct(productId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Sản phẩm không tồn tại!');
        }
        
        if (product.seller?.email) {
            await mailService.notifyAuctionCancelled(product.seller.email, product.product_name);
        }
        
        if (product.current_highest_bidder?.email) {
            await mailService.notifyAuctionCancelled(product.current_highest_bidder.email, product.product_name);
        }
        
        return await productRepository.cancelProduct(productId);
    }
}
export const productService = new ProductService();