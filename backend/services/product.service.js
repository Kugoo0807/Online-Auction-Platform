import { productRepository } from '../repositories/product.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';

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
        return await productRepository.findByCondition(undefined, {}, sortOption, 5);
    }

    async findTop5HighestPriceProducts() {
        const sortOption = { current_highest_price : -1 };
        return await productRepository.findByCondition(undefined, {}, sortOption, 5);
    }

    async findTop5MostBiddedProducts() {
        const sortOption = { bid_count : -1 };
        return await productRepository.findByCondition(undefined, {}, sortOption, 5);
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
}

export const productService = new ProductService();