import { Bid } from '../../db/schema.js';

class BidRepository {
    async create(bidData, session) {
        const bid = new Bid({
            user: bidData.user,
            product: bidData.product,
            price: bidData.price,
            max_bid_price: bidData.max_bid_price,
            holder: bidData.holder
        });
        return await bid.save({ session });
    }

    async findByProduct(productId) {
        return await Bid.find({ product: productId })
            .sort({ createdAt: -1 })
            .populate('user', 'full_name rating')
            .populate('holder', 'full_name rating');
    }
}

export const bidRepository = new BidRepository();