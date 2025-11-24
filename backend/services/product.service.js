import { productRepository } from '../repositories/product.repository.js';

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
}

export const productService = new ProductService();