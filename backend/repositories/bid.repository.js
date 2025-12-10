import { Bid } from '../../db/schema.js';

class BidRepository {
    async create(bidData, session) {
        const bid = new Bid(bidData);
        return await bid.save({ session });
    }

    async findByProduct(productId, session = null) {
        return await Bid.find({ product: productId }).session(session)
            .sort({ createdAt: -1 })
            .populate('user', 'full_name rating_count rating_score is_deleted');
    }
}

export const bidRepository = new BidRepository();