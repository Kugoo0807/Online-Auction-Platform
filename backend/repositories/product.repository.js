import { Product } from '../../db/schema.js';

class ProductRepository { 
    async create(productData) { 
        const product = new Product({
            product_name: productData.product_name,
            start_price: productData.start_price,
            bid_increment: productData.bid_increment,
            buy_it_now_price: productData.buy_it_now_price ?? undefined,
            thumbnail: productData.thumbnail,
            images: productData.images,
            auction_end_time: productData.auction_end_time,
            seller: productData.seller,
            category: productData.category,
            description: productData.description,
            auto_renew: productData.auto_renew,
            max_bids_per_bidder: productData.max_bids_per_bidder ?? 2
            });
        return await product.save();
    }
    
    async findById(product) {
        return await Product.findById(product)
            .populate('seller', 'full_name rating') 
            .populate('category', 'category_name')
            .populate('current_highest_bidder', 'full_name rating');
    }
    
    async findByName(productName) {
        return await Product.find({ product_name: productName });
    }

    async findByCondition(keyword, filter = {}, sortOption = {}, limit = 10, page = 1) {
        if (keyword) {
            filter.$or = [
                { product_name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]; 
        }

        const finalSort = Object.keys(sortOption).length ? sortOption : { auction_end_time: 1 };
        
        const skip = (page - 1) * limit;

        return await Product.find(filter)
            .sort(finalSort)
            .skip(skip)
            .limit(limit)
            .populate('seller', 'full_name rating') 
            .populate('category', 'category_name')
            .populate('current_highest_bidder', 'full_name rating');
    }

    async findRandom(filter, limit) {
        const docs = await Product.aggregate([
            { $match: filter },
            { $sample: { size: limit } }
        ]);

        return await Product.populate(docs, [
            { path: 'seller', select: 'full_name rating' },
            { path: 'category', select: 'category_name' },
            { path: 'current_highest_bidder', select: 'full_name rating'}
        ]);
    }

    async findExpired() {
        const now = new Date();
        return await Product.find({
            auction_status: 'active',
            auction_end_time: { $lt: now }
        });
    }
    
    async removeProduct(product) {
        return await Product.findByIdAndDelete(product);
    }

    async findBySeller (seller) {
        return await Product.find({ seller })
            .populate('seller', 'full_name rating') 
            .populate('category', 'category_name')
            .populate('current_highest_bidder', 'full_name rating');
    }

    // Xử lí transaction
    async findByIdForUpdate(id, session) {
        return await Product.findById(id).session(session);
    }

    async save(productDocument, session) {
        return await productDocument.save({ session });
    }

    async addBannedBidder(product, bidder) {
        return await Product.findByIdAndUpdate(
            product,
            { $addToSet: { banned_bidder: bidder } }, 
            { new: true, runValidators: true }
        );
    }

    async removeBannedBidder(product, bidder) {
        return await Product.findByIdAndUpdate(
            product,
            { $pull: { banned_bidder: bidder } }, 
            { new: true } 
        );
    }

    async findBannedBidders(productId) {
        const foundProduct = await Product.findById(productId).select('banned_bidder');
        return foundProduct ? foundProduct.banned_bidder : [];
    }

    async updateProductInfo(product, updateData) {
        return await Product.findByIdAndUpdate(product, updateData, { new: true, runValidators: true });
    }
    
    async existsInCategories(categoryIds) {
        const result = await Product.exists({ category: { $in: categoryIds } });
        return !!result;
    }
}

export const productRepository = new ProductRepository();