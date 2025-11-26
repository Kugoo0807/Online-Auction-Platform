import { Product } from '../../db/schema.js';

class ProductRepository { 
    async create(productData) { 
        const product = new Product({
            product_name: productData.product_name,
            start_price: productData.start_price,
            bid_increment: productData.bid_increment,
            buy_it_now_price: productData.buy_it_now_price ?? undefined,
            images: productData.image,
            auction_end_time: productData.auction_end_time,
            seller_id: productData.seller_id,
            category_id: productData.category_id,
            description: productData.description,
            auto_renew: productData.auto_renew,
            max_bids_per_bidder: productData.max_bids_per_bidder ?? 2,
            bid_count: productData.bid_count ?? 0
            });
        return await product.save();
    }
    
    async findById(product_id) {
        return await Product.findById(product_id)
            .populate('seller_id', 'full_name rating') 
            .populate('category_id', 'category_name');
    }
    
    async findByName(productName) {
        return await Product.find({ product_name: productName });
    }

    async findByCondition(keyword, filter = {}, sortOption = {}, limit = 5) {
        if (keyword) {
            filter.$or = [
                { product_name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]; 
        }
        const finalSort = Object.keys(sortOption).length ? sortOption : { auction_end_time: 1 };
        return await Product.find(filter)
            .sort(finalSort)
            .limit(limit);
    }
    
    async removeProduct(product_id) {
        return await Product.findByIdAndDelete(product_id);
    }

    async findBySeller (seller_id) {
        return await Product.find({ seller_id });
    }

    async addBannedBidder(product_id, bidder_id) {
        return await Product.findByIdAndUpdate(
            product_id,
            { $addToSet: { banned_bidder_id: bidder_id } }, 
            { new: true, runValidators: true }
        );
    }

    async removeBannedBidder(product_id, bidder_id) {
        return await Product.findByIdAndUpdate(
            product_id,
            { $pull: { banned_bidder_id: bidder_id } }, 
            { new: true } 
        );
    }

    async findBannedBidders(product_id) {
        const product = await Product.findById(product_id).select('banned_bidder_id');
        return product ? product.banned_bidder_id: [];
    }

    async updateProductInfo(product_id, updateData) {
        return await Product.findByIdAndUpdate(product_id, updateData, { new: true, runValidators: true });
    }
    
    async existsInCategories(categoryIds) {
        const result = await Product.exists({ category_id: { $in: categoryIds } });
        return !!result;
    }
}

export const productRepository = new ProductRepository();