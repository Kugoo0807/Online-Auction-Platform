import { productRepository } from '../repositories/product.repository.js';
import { bidRepository } from '../repositories/bid.repository.js';
import { executeTransaction } from '../utils/db.helper.js';
import { recalculateAuctionState } from '../utils/auction.helper.js';

class BidService {
    async placeBid(userId, productId, amount) {
        return await executeTransaction(async (session) => {
            // 1. Lock & Load Product
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại!");

            // 2. Validate Trạng thái & Thời gian
            if (product.auction_status !== 'active') {
                throw new Error("Phiên đấu giá này không còn hoạt động (Đã kết thúc, đã bán hoặc bị hủy)");
            }
            
            const now = new Date();
            if (now > product.auction_end_time) {
                product.auction_status = 'ended';
                await productRepository.save(product, session);
                throw new Error("Phiên đấu giá đã kết thúc!");
            }

            // Validate Quyền hạn
            if (product.seller.toString() === userId) throw new Error("Không thể tự đấu giá sản phẩm của mình!");
            if (product.banned_bidder && product.banned_bidder.includes(userId)) {
                throw new Error("Bạn đã bị người bán chặn đấu giá sản phẩm này!");
            }

            // Validate Số lượt Bid
            const currentBidCount = product.bid_counts.get(userId) || 0;
            if (currentBidCount >= product.max_bids_per_bidder) {
                throw new Error(`Bạn đã hết lượt ra giá (Tối đa: ${product.max_bids_per_bidder} lần)`);
            }
            
            // Nếu có giá Mua ngay và user trả >= giá đó
            let isBuyItNow = false;
            if (product.buy_it_now_price && amount >= product.buy_it_now_price) {
                isBuyItNow = true;
                amount = product.buy_it_now_price;
            } 
            else {
                // === VALIDATE GIÁ CHO ĐẤU GIÁ THƯỜNG ===
                
                // Check giá phải cao hơn giá cũ của chính mình
                const userCurrentMaxBid = product.auto_bid_map.get(userId);
                if (userCurrentMaxBid !== undefined && amount <= userCurrentMaxBid) {
                    throw new Error(`Giá mới phải cao hơn mức giá cũ bạn đã đặt (${userCurrentMaxBid})`);
                }

                // Check giá phải cao hơn sàn toàn cục
                const globalMinPrice = product.bid_count === 0
                    ? product.start_price 
                    : product.current_highest_price + product.bid_increment;

                if (amount < globalMinPrice) {
                    throw new Error(`Giá đặt không hợp lệ. Sàn hiện tại yêu cầu tối thiểu: ${globalMinPrice}`);
                }
            }

            // Cập nhật dữ liệu
            product.bid_counts.set(userId, currentBidCount + 1);
            product.auto_bid_map.set(userId, amount);
            product.bid_count += 1;

            // 7. XỬ LÝ LOGIC RIÊNG
            if (isBuyItNow) {
                // === TRƯỜNG HỢP MUA NGAY ===
                product.auction_status = 'sold';
                product.current_highest_price = amount;
                product.current_highest_bidder = userId;
            } else {
                // === TRƯỜNG HỢP ĐẤU GIÁ THƯỜNG ===
                
                // Tính toán lại winner và price dựa trên thuật toán
                recalculateAuctionState(product);

                // Logic Auto Renew (Gia hạn 10p nếu còn < 5p)
                if (product.auto_renew) {
                    const timeLeft = product.auction_end_time.getTime() - now.getTime();
                    if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
                        product.auction_end_time = new Date(product.auction_end_time.getTime() + 10 * 60 * 1000);
                    }
                }
            }

            await productRepository.save(product, session);
            const finalPrice = product.current_highest_price;
            const finalWinnerId = product.current_highest_bidder;

            await bidRepository.create({
                user: userId,
                product: productId,
                price: finalPrice, 
                max_bid_price: amount
            }, session);

            return {
                success: true,
                current_price: finalPrice,
                winner_id: finalWinnerId,
                status: product.auction_status,
                message: isBuyItNow ? "Chúc mừng! Bạn đã mua ngay sản phẩm thành công." : "Ra giá thành công"
            };
        });
    }

    async getBidHistory(productId) {
        const product = await productRepository.findById(productId);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm!');
        }
        const bannedSet = new Set(
            (product.banned_bidder || []).map(id => id.toString())
        );

        const history = await bidRepository.findByProduct(productId);

        // Thêm cờ 'is_banned'
        const result = history.map(h => {
            const bidObj = h.toObject ? h.toObject() : h;
            const userId = bidObj.user?._id || bidObj.user;
            return {
                ...bidObj,
                is_banned: userId ? bannedSet.has(userId.toString()) : false
            }
        })
        
        return result;
    }
}

export const bidService = new BidService();