import { ChatMessage } from '../../db/schema.js';

class ChatMessageRepository {
  async create({ auction_result, sender, content }) {
    const msg = new ChatMessage({ auction_result, sender, content });
    return await msg.save();
  }

  async findByAuctionResult(auctionResultId, { limit = 50, skip = 0, sort = { createdAt: 1 } } = {}) {
    return await ChatMessage.find({ auction_result: auctionResultId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('sender', 'full_name role');
  }

  async getUnreadCount(auctionResultId, userId) {
    return await ChatMessage.countDocuments({ auction_result: auctionResultId, is_read: false, sender: { $ne: userId } });
  }

  async markAsRead(messageId) {
    return await ChatMessage.findByIdAndUpdate(messageId, { is_read: true }, { new: true });
  }

  async markAllAsRead(auctionResultId, userId) {
    const res = await ChatMessage.updateMany(
      { auction_result: auctionResultId, is_read: false, sender: { $ne: userId } },
      { $set: { is_read: true } }
    );
    return res.modifiedCount;
  }

  async deleteById(messageId) {
    return await ChatMessage.findByIdAndDelete(messageId);
  }
}

export const chatMessageRepository = new ChatMessageRepository();
