import dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import mongoose from 'mongoose';
import { productRepository } from '../repositories/product.repository.js';
import { auctionResultRepository } from '../repositories/auction.result.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { notifyAuctionEndedSold, notifyAuctionEndedNoBid, notifyAuctionWinner } from '../services/email.service.js';

import { executeTransaction } from '../../db/db.helper.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'product/' || 'http://localhost:3000/product/';

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
            try {
                await executeTransaction(async (session) => {
                    const currentProduct = await productRepository.findById(product._id, null, { session }); 
                    
                    // Kiểm tra trạng thái
                    if (!currentProduct || currentProduct.auction_status !== 'active') {
                        return; 
                    }

                    // Nếu có bidder thắng cuộc
                    if (currentProduct.current_highest_bidder) {
                        currentProduct.auction_status = 'sold';
                        await currentProduct.save({ session });

                        await auctionResultRepository.create({
                            product: currentProduct._id,
                            winning_bidder: currentProduct.current_highest_bidder._id,
                            seller: currentProduct.seller._id,
                            final_price: currentProduct.current_highest_price,
                            status: 'pending_payment'
                        }, session);

                        console.log(`[CRON] [SOLD] ID: ${currentProduct._id} | Price: ${currentProduct.current_highest_price}`);
                        
                        // Gửi email thông báo seller và bidder
                        const mailSeller = currentProduct.seller.email;
                        const mailBidder = currentProduct.current_highest_bidder.email;
                        const productLink = PRODUCT_URL_PREFIX + currentProduct._id.toString();

                        await notifyAuctionEndedSold(
                            mailSeller,
                            currentProduct.product_name,
                            currentProduct.current_highest_bidder.full_name,
                            currentProduct.current_highest_price,
                            productLink
                        );

                        await notifyAuctionWinner(
                            mailBidder,
                            currentProduct.product_name,
                            currentProduct.current_highest_price,
                            productLink
                        );
                        
                    } else {
                        // Không có bidder nào
                        currentProduct.auction_status = 'ended';
                        await currentProduct.save({ session });

                        console.log(`[CRON] [ENDED] ID: ${currentProduct._id} | Không có bidder`);
                        
                        // Gửi mail cho seller
                        const mailSeller = currentProduct.seller.email;
                        const productLink = PRODUCT_URL_PREFIX + currentProduct._id.toString();

                        await notifyAuctionEndedNoBid(
                            mailSeller,
                            currentProduct.product_name,
                            productLink
                        );
                    }
                });

            } catch (err) {
                console.error(`[CRON] [ERROR] Product ${product._id}: ${err.message}`);
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