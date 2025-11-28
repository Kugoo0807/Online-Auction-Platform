import { WatchList } from '../../db/schema.js';

class WatchListRepository {
  async add(userId, productId) {
    return await WatchList.findOneAndUpdate(
      { user: userId, product: productId }, 
      { user: userId, product: productId }, 
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async remove(userId, productId) {
    return await WatchList.findOneAndDelete({ 
      user: userId, 
      product: productId 
    });
  }

async getByUserId(userId) {
    return await WatchList.find({ user: userId }) 
      .populate({
        path: 'product', 
        select: 'product_name start_price images auction_end_time' 
      })
      .sort({ timestamp_added: -1 })
      .lean();
  }

  async exists(userId, productId) {
    const item = await WatchList.exists({ user: userId, product: productId });
    return !!item; 
  }

  async countByProductId(productId) {
    return await WatchList.countDocuments({ product: productId });
  }
}

export const watchListRepository = new WatchListRepository();