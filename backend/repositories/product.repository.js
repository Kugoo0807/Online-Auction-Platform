import { Product } from '../../db/schema.js';
import { Category } from '../../db/schema.js';

class ProductRepository { 
    async create(productData) { 
        const product = new Product(productData);
        return await product.save();
    }

    async findAll() {
        return await Product.find()
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }
    
    async findById(product, session = null) {
        return await Product.findById(product).session(session)
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
    }
    
    async findByName(productName) {
        return await Product.find({ product_name: productName });
    }

    async findByCondition(keyword, filter = {}, sortOption = {}, limit = 0) {
        if (keyword) {
            // Tìm các category có tên khớp với từ khóa
            const matchingCategories = await Category.find({ 
                category_name: { $regex: keyword, $options: 'i' } 
            }).select('_id');

            const matchingCategoryIds = matchingCategories.map(cat => cat._id);

            // Thêm điều kiện tìm kiếm vào filter
            filter.$or = [
                { product_name: { $regex: keyword, $options: 'i' } },
                { description_current: { $regex: keyword, $options: 'i' } },
                { category: { $in: matchingCategoryIds } } 
            ];
        }

        const finalSort = Object.keys(sortOption).length ? sortOption : { auction_end_time: 1 };

        // Tạo query
        const query = Product.find(filter).sort(finalSort);

        if (limit > 0) {
            query.limit(limit);
        }

        return await query
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count')
            .lean();
    }

    async findRandom(filter, limit) {
        const docs = await Product.aggregate([
            { $match: filter },
            { $sample: { size: limit } }
        ]);

        return await Product.populate(docs, [
            { path: 'seller', select: 'full_name email rating_score rating_count' },
            { path: 'category', select: 'category_name slug' },
            { path: 'current_highest_bidder', select: 'full_name email rating_score rating_count'}
        ]);
    }

    async findExpired() {
        const now = new Date();
        return await Product.find({
            auction_status: 'active',
            auction_end_time: { $lt: now }
        });
    }

    async findActive(userId) {
        return await Product.find({
            seller: userId,
            auction_status: 'active'
        });
    }

    async findProductsUserIsLeading(userId) {
        return await Product.find({
            current_highest_bidder: userId,
            auction_status: 'active'
        })
    }
    
    async removeProduct(product) {
        return await Product.findByIdAndDelete(product);
    }

    async findBySeller (seller) {
        return await Product.find({ seller })
            .populate('seller', 'full_name email rating_score rating_count') 
            .populate('category', 'category_name slug')
            .populate('current_highest_bidder', 'full_name email rating_score rating_count');
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

    async updateProductInfo(productId, updateData) {
        const product = await Product.findById(productId);
        if (!product) return null;

        Object.assign(product, updateData);

        return await product.save();
    }

    async appendDescription(productId, newDescriptionContent) {
        const product = await Product.findById(productId);
        if (!product) return null;

        // Push vào mảng history
        product.description_history.push({
            content: newDescriptionContent,
            timestamp: new Date()
        });

        return await product.save();
    }
    
    async existsInCategories(categoryIds) {
        const result = await Product.exists({ category: { $in: categoryIds } });
        return !!result;
    }

    async cancelProduct(productId) {
        return await Product.findByIdAndUpdate(
            productId,
            { auction_status: 'cancelled' },
            { new: true }
        );
    }
}

export const productRepository = new ProductRepository();