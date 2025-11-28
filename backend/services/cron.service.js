import cron from 'node-cron';
import { productRepository } from '../repositories/product.repository.js';
import { auctionResultRepository } from '../repositories/auctionResult.repository.js';

class CronService {
    start() {
        // Chạy mỗi 1 phút: '* * * * *'
        cron.schedule('* * * * *', async () => {
            await this.closeEndedAuctions();
        });
    }

    async closeEndedAuctions() {
        const now = new Date();
        
        // Tìm sản phẩm hết hạn mà vẫn đang active
        const expiredProducts = await productRepository.findExpired();

        if (expiredProducts.length === 0) return;

        // Log tổng quan số lượng tìm thấy
        console.log(`[${new Date().toISOString()}] [CRON] [SCAN] Tìm thấy ${expiredProducts.length} sản phẩm cần chốt.`);

        for (const product of expiredProducts) {
            try {
                // Transaction bắt đầu
                product.auction_status = 'ended';
                await product.save();

                // Nếu có người thắng, ghi vào bảng kết quả
                if (product.current_highest_bidder) {
                    await auctionResultRepository.create({
                        product: product._id,
                        winning_bidder: product.current_highest_bidder,
                        final_price: product.current_highest_price,
                        payment_status: 'pending'
                    });

                    console.log(`[${new Date().toISOString()}] [CRON] [CLOSE] SOLD | Product: "${product.product_name}" (${product._id}) | Winner: ${product.current_highest_bidder} | Price: ${product.current_highest_price}`);
                    
                    // TODO: Gửi email cho Winner và Seller
                } else {
                    console.log(`[${new Date().toISOString()}] [CRON] [CLOSE] NO BID | Product: "${product.product_name}" (${product._id}) | Kết thúc không người mua.`);
                    
                    // TODO: Gửi email báo Seller
                }
            } catch (err) {
                console.error(`[${new Date().toISOString()}] [CRON] [ERROR] FAILED | Product: ${product._id} | Error: ${err.message}`);
            }
        }
        
        console.log(`[${new Date().toISOString()}] [CRON] [DONE] Hoàn tất xử lý batch.`);
    }
}

export const cronService = new CronService();