import dotenv from 'dotenv';
dotenv.config();
import { productRepository } from '../repositories/product.repository.js';
import { bidRepository } from '../repositories/bid.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';

import { executeTransaction } from '../../db/db.helper.js';
import { recalculateAuctionState } from '../utils/auction.util.js';
import * as mailService from '../services/email.service.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'auction/' || 'http://localhost:3000/auction/';
class BidService {
    async placeBid(userId, productId, amount) {
        return await executeTransaction(async (session) => {
            // Lock & Load Product
            const product = await productRepository.findByIdForUpdate(productId, session);
            if (!product) throw new Error("Sản phẩm không tồn tại!");

            // Validate Trạng thái & Thời gian
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
            if (product.banned_bidder && product.banned_bidder.some(id => id.toString() === userId)) {
                throw new Error("Bạn đã bị người bán chặn đấu giá sản phẩm này!");
            }

            // Validate Điểm đánh giá
            const bidder = await userRepository.findById(userId);
            if (!bidder) throw new Error("Không tìm thấy thông tin người dùng");

            if (bidder.rating_count === 0) {
                if (!product.allow_newbie) {
                    throw new Error('Sản phẩm này không cho phép người mới (chưa có đánh giá) tham gia!');
                }
            } else {
                const positiveCount = (bidder.rating_count + bidder.rating_score) / 2;
                const positiveRatio = positiveCount / bidder.rating_count;

                if (positiveRatio < 0.8) {
                    throw new Error(`Điểm uy tín thấp (${(positiveRatio * 100).toFixed(1)}%). Yêu cầu trên 80% mới được đấu giá.`);
                }
            }

            // LOGIC MUA NGAY HOẶC ĐẤU GIÁ
            let isBuyItNow = false;

            // Check mua Ngay
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
            // Lưu previous holder để gửi email sau
            const previousHolderId = product.current_highest_bidder;
            // Cập nhật dữ liệu
            const currentBidCount = product.bid_counts.get(userId) || 0;
            product.bid_counts.set(userId, currentBidCount + 1);
            product.auto_bid_map.set(userId, amount);
            product.bid_count += 1;

            // XỬ LÝ LOGIC RIÊNG
            if (isBuyItNow) {
                // === TRƯỜNG HỢP MUA NGAY ===
                product.auction_status = 'sold';
                product.current_highest_price = amount;
                product.current_highest_bidder = userId;

                // Tạo đơn hàng
                await auctionResultRepository.create({
                    product: product._id,
                    winning_bidder: userId,
                    seller: product.seller,
                    final_price: amount,
                    status: 'pending_payment'
                }, session);
                // Gửi email thông báo
                try {
                    const productUrl = PRODUCT_URL_PREFIX + product._id;
                    const [seller, winner] = await Promise.all([
                        userRepository.findById(product.seller),
                        userRepository.findById(userId)
                    ]);

                    if (seller?.email) {
                        await mailService.notifyAuctionEndedSold(
                            seller.email,
                            product.product_name,
                            winner?.full_name || 'Người mua',
                            amount,
                            productUrl
                        );
                    }
                    if (winner?.email) {
                        await mailService.notifyAuctionWinner(
                            winner.email,
                            product.product_name,
                            amount,
                            productUrl
                        );
                    }
                } catch (emailError) {
                    console.error('Lỗi gửi email mua ngay:', emailError);
                }
            } else {
                // === TRƯỜNG HỢP ĐẤU GIÁ THƯỜNG ===

                // Lưu người giữ giá cũ trước khi recalculate

                // Tính toán lại winner và price dựa trên thuật toán
                await recalculateAuctionState(product, userId, session);

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
                max_bid_price: amount,
                holder: finalWinnerId
            }, session);

            // === GỬI EMAIL SAU KHI ĐẤU GIÁ THÀNH CÔNG ===
            if (!isBuyItNow) {
                try {
                    const productUrl = PRODUCT_URL_PREFIX + productId;
                    
                    // Lấy thông tin đầy đủ của các bên liên quan
                    const [seller, bidder, currentHolder, previousHolder] = await Promise.all([
                        userRepository.findById(product.seller),
                        userRepository.findById(userId),
                        finalWinnerId ? userRepository.findById(finalWinnerId) : null,
                        previousHolderId ? userRepository.findById(previousHolderId) : null
                    ]);

                    // 1. GỬI CHO NGƯỜI BÁN
                    if (seller?.email) {
                        await mailService.notifyNewBidToSeller(
                            seller.email,
                            product.product_name,
                            finalPrice,
                            bidder?.full_name || 'Người dùng',
                            productUrl
                        );
                    }

                    // 2. GỬI CHO NGƯỜI RA GIÁ (xác nhận)
                    if (bidder?.email) {
                        await mailService.notifyBidSuccess(
                            bidder.email,
                            product.product_name,
                            currentHolder?.full_name || 'Bạn',
                            amount,
                            finalPrice,
                            productUrl
                        );
                    }

                    // 3. GỬI CHO NGƯỜI GIỮ GIÁ TRƯỚC ĐÓ (nếu có và khác người vừa ra giá)
                    if (previousHolderId && previousHolderId.toString() !== userId && previousHolder?.email) {
                        await mailService.notifyHolder(
                            previousHolder.email,
                            product.product_name,
                            finalPrice,
                            finalWinnerId?.toString() === previousHolder._id.toString() 
                                ? previousHolder.email 
                                : bidder?.email || '',
                            productUrl
                        );
                    }
                } catch (emailError) {
                    console.error('Lỗi gửi email sau khi đấu giá:', emailError);
                    // Không throw error để không ảnh hưởng transaction
                }
            }

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
        if (!product) throw new Error('Không tìm thấy sản phẩm!');

        const bannedSet = new Set(
            (product.banned_bidder || []).map(id => id.toString())
        );

        const history = await bidRepository.findByProduct(productId);

        const currentPrice = product.current_highest_price;

        const result = history.map(h => {
            const bidObj = h.toObject ? h.toObject() : h;
            const user = bidObj.user;
            const holder = bidObj.holder;

            let displayPrice = bidObj.price;

            if (bidObj.price > currentPrice) {
                displayPrice = currentPrice;
            }

            if (!user) {
                return {
                    ...bidObj,
                    price: displayPrice,
                    user: user,

                    is_valid: !isInvalid,
                    is_deleted: isDeleted,
                    is_banned: isBanned,
                    max_price: undefined,

                    invalid_holder: null,
                    holder: holder
                };
            }

            const userIdStr = user._id.toString();
            const isBanned = bannedSet.has(userIdStr);
            const isDeleted = user.is_deleted === true;
            const isInvalid = isDeleted || isBanned;

            const isHolderInvalid = holder?.is_deleted === true || bannedSet.has(holder?._id.toString());

            return {
                ...bidObj,
                price: displayPrice,
                user: user,

                is_valid: !isInvalid,
                is_deleted: isDeleted,
                is_banned: isBanned,
                max_price: undefined,

                invalid_holder: isHolderInvalid,
                holder: holder
            }
        })

        return result;
    }
}

export const bidService = new BidService();