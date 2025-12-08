import dotenv from 'dotenv';
dotenv.config();
import cron from 'node-cron';
import mongoose from 'mongoose';
import { productRepository } from '../repositories/product.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { notifyAuctionEndedSold, notifyAuctionEndedNoBid } from '../services/email.service.js';
import * as mailService from '../services/email.service.js';
const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'auction/' || 'http://localhost:3000/auction/';
class CronService {
    start() {
        // Chạy mỗi 1 phút: '* * * * *'
        cron.schedule('* * * * *', async () => {
            await this.closeEndedAuctions();
        });

        // Chạy mỗi 10 phút: '* * * * *'
        cron.schedule('*/10 * * * *', async () => {
            await this.downgradeExpiredSellers();
        });
    }

    async closeEndedAuctions() {
        // Tìm sản phẩm hết hạn mà vẫn đang active
        const expiredProducts = await productRepository.findExpired();
        if (expiredProducts.length === 0) return;

        // Log tổng quan số lượng tìm thấy
        console.log(`[${new Date().toISOString()}] [CRON] [SCAN] Tìm thấy ${expiredProducts.length} sản phẩm cần chốt.`);

        for (const product of expiredProducts) {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const currentProduct = await productRepository.findById(product._id);
                if (currentProduct.auction_status !== 'active') {
                    await session.abortTransaction();
                    session.endSession();
                    continue;
                }

                // Nếu có người thắng, ghi vào bảng kết quả
                if (currentProduct.current_highest_bidder) {
                    // Transaction bắt đầu
                    currentProduct.auction_status = 'sold';
                    await currentProduct.save({ session });

                    await auctionResultRepository.create({
                        product: currentProduct._id,
                        winning_bidder: currentProduct.current_highest_bidder,
                        seller: currentProduct.seller,
                        final_price: currentProduct.current_highest_price,
                        status: 'pending_payment'
                    }, session);

                    await session.commitTransaction();

                    console.log(`[CRON] [SOLD] ID: ${currentProduct._id} | Price: ${currentProduct.current_highest_price}`);

                    // Gửi email cho Winner và Seller
                    try {
                        const productUrl = PRODUCT_URL_PREFIX + currentProduct._id;
                        const [seller, winner] = await Promise.all([
                            userRepository.findById(currentProduct.seller),
                            userRepository.findById(currentProduct.current_highest_bidder)
                        ]);

                        if (seller?.email) {
                            await mailService.notifyAuctionEndedSold(
                                seller.email,
                                currentProduct.product_name,
                                winner?.full_name || 'Người thắng',
                                currentProduct.current_highest_price,
                                productUrl
                            );
                        }
                        if (winner?.email) {
                            await mailService.notifyAuctionWinner(
                                winner.email,
                                currentProduct.product_name,
                                currentProduct.current_highest_price,
                                productUrl
                            );
                        }
                    } catch (emailError) {
                        console.error(`[CRON] [EMAIL ERROR] Product ${currentProduct._id}:`, emailError.message);
                    }
                } else {
                    // Transaction bắt đầu
                    currentProduct.auction_status = 'ended';
                    await currentProduct.save({ session });

                    await session.commitTransaction();

                    console.log(`[CRON] [ENDED] ID: ${currentProduct._id} | Không có bidder`);

                    // Gửi email báo Seller
                    try {
                        const productUrl = PRODUCT_URL_PREFIX + currentProduct._id;
                        const seller = await userRepository.findById(currentProduct.seller);

                        if (seller?.email) {
                            await mailService.notifyAuctionEndedNoBid(
                                seller.email,
                                currentProduct.product_name,
                                productUrl
                            );
                        }
                    } catch (emailError) {
                        console.error(`[CRON] [EMAIL ERROR] Product ${currentProduct._id}:`, emailError.message);
                    }
                }
            } catch (err) {
                await session.abortTransaction();
                console.error(`[CRON] [ERROR] Product ${product._id}: ${err.message}`);
            } finally {
                session.endSession();
            }
        }

        console.log(`[${new Date().toISOString()}] [CRON] [DONE] Hoàn tất xử lý batch.`);
    }

    async downgradeExpiredSellers() {
        console.log(`[${new Date().toISOString()}] [CRON] Đang quét Seller hết hạn...`);
        try {
            const result = await userRepository.downgradeExpiredSellers();

            if (result.modifiedCount > 0) {
                console.log(`[CRON] Đã hạ cấp ${result.modifiedCount} seller do hết hạn.`);
            }
        } catch (error) {
            console.error('[CRON ERROR] Hạ bậc Seller:', error);
        }
    }
}

export const cronService = new CronService();