import { productRepository } from '../repositories/product.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { executeTransaction } from '../../db/db.helper.js';
import { recalculateAuctionState } from '../utils/auction.util.js';

const LIMIT_ITEMS = 8;

class ProductService {
    async createProduct(productData) {
        return await productRepository.create(productData);
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

    async getProductsByCategorySlug(slug, page = 1) {
        const category = await categoryRepository.findBySlug(slug);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        const allCategoryIds = await categoryRepository.getAllDescendantIds(category._id);
        const filter = { category: {$in: allCategoryIds }};

        return await productRepository.findByCondition(undefined, filter, {}, LIMIT_ITEMS, page);
    }

    async getProductsBySellerId(seller, page = 1) {
        const filter = { seller: seller };
        const sortOption = { createdAt: -1 };
        return await productRepository.findByCondition(undefined, filter, sortOption, LIMIT_ITEMS, page);
    }

    async searchProducts(keyword, page = 1) {
        return await productRepository.findByCondition(keyword, {}, {}, LIMIT_ITEMS, page);
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

        const globalFloor = product.bid_count === 0
            ? product.start_price
            : product.current_highest_price + product.bid_increment;
        
        const userFloor = product.auto_bid_map.get(userId.toString()) || 0;

        return {
            min_valid_price: Math.max(globalFloor, userFloor + 1)
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
}

export const productService = new ProductService();