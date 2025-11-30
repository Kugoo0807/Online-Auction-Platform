import { chatMessageRepository } from '../repositories/chat.message.repository.js';

class ChatMessageService {
  async sendMessage({ auction_result, sender, content }) {
    if (!auction_result || !sender || !content || !content.trim()) {
      throw new Error('Thiếu dữ liệu: auction_result, sender, content');
    }
    return await chatMessageRepository.create({ auction_result, sender, content: content.trim() });
  }

  async listMessages(auctionResultId, options = {}) {
    if (!auctionResultId) throw new Error('Thiếu auctionResultId');
    const { limit = 50, skip = 0, sort = { createdAt: 1 } } = options;
    return await chatMessageRepository.findByAuctionResult(auctionResultId, { limit, skip, sort });
  }

  async getUnreadCount(auctionResultId, userId) {
    if (!auctionResultId || !userId) throw new Error('Thiếu auctionResultId hoặc userId');
    return await chatMessageRepository.getUnreadCount(auctionResultId, userId);
  }

  async markAsRead(messageId) {
    if (!messageId) throw new Error('Thiếu messageId');
    return await chatMessageRepository.markAsRead(messageId);
  }

  async markAllAsRead(auctionResultId, userId) {
    if (!auctionResultId || !userId) throw new Error('Thiếu auctionResultId hoặc userId');
    return await chatMessageRepository.markAllAsRead(auctionResultId, userId);
  }

  async deleteMessage(messageId) {
    if (!messageId) throw new Error('Thiếu messageId');
    return await chatMessageRepository.deleteById(messageId);
  }
}

export const chatMessageService = new ChatMessageService();
