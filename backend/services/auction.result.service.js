import { auctionResultRepository } from '../repositories/auction.result.repository.js';
// import { ratingRepository } from '../repositories/rating.repository.js'; // Mở ra khi làm module Rating
import { executeTransaction } from '../../db/db.helper.js';

class AuctionResultService {

    // Lấy chi tiết đơn hàng (Dùng chung cho cả 2 bên xem)
    async getOrderDetails(orderId, userId) {
        const order = await auctionResultRepository.findById(orderId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // Validate: Chỉ người mua hoặc người bán mới được xem
        const isBuyer = order.winning_bidder._id.toString() === userId;
        const isSeller = order.seller._id.toString() === userId;

        if (!isBuyer && !isSeller) {
            throw new Error("Bạn không có quyền xem đơn hàng này");
        }

        return order;
    }

    // --- BƯỚC 1: NGƯỜI MUA THANH TOÁN ---
    async submitPayment(userId, productId, address, paymentProofUrl) {
        // 1. Tìm đơn hàng qua Product ID
        const order = await auctionResultRepository.findByProduct(productId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        // 2. Validate quyền hạn
        if (order.winning_bidder._id.toString() !== userId) {
            throw new Error("Bạn không phải người thắng cuộc của sản phẩm này");
        }

        // 3. Validate trạng thái
        if (order.status !== 'pending_payment') {
            throw new Error("Trạng thái đơn hàng không hợp lệ để thanh toán");
        }

        // 4. Update
        return await auctionResultRepository.updatePaymentInfo(order._id, address, paymentProofUrl);
    }

    // --- BƯỚC 2: SELLER XÁC NHẬN GỬI HÀNG ---
    async confirmShipment(userId, productId, shippingProofUrl) {
        const order = await auctionResultRepository.findByProduct(productId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        if (order.seller._id.toString() !== userId) {
            throw new Error("Bạn không phải người bán sản phẩm này");
        }

        if (order.status !== 'pending_shipment') {
            throw new Error("Người mua chưa thanh toán hoặc đơn hàng đã được xử lý");
        }

        return await auctionResultRepository.updateShipmentInfo(order._id, shippingProofUrl);
    }

    // --- BƯỚC 3: NGƯỜI MUA XÁC NHẬN ĐÃ NHẬN HÀNG ---
    async confirmReceipt(userId, productId) {
        const order = await auctionResultRepository.findByProduct(productId);
        if (!order) throw new Error("Đơn hàng không tồn tại");

        if (order.winning_bidder._id.toString() !== userId) {
            throw new Error("Không có quyền thực hiện");
        }

        if (order.status !== 'shipping') {
            throw new Error("Đơn hàng chưa được gửi đi hoặc đã hoàn tất");
        }

        return await auctionResultRepository.completeTransaction(order._id);
    }

    // --- HUỶ GIAO DỊCH (SELLER ONLY) ---
    async cancelTransaction(sellerId, productId, reason) {
        // Dùng transaction vì cần update đơn hàng VÀ trừ điểm uy tín cùng lúc
        return await executeTransaction(async (session) => {
            const order = await auctionResultRepository.findByProduct(productId);
            if (!order) throw new Error("Đơn hàng không tồn tại");

            // 1. Validate
            if (order.seller._id.toString() !== sellerId) {
                throw new Error("Bạn không có quyền huỷ đơn hàng này");
            }
            if (order.status === 'completed' || order.status === 'cancelled') {
                throw new Error("Không thể huỷ đơn hàng đã hoàn tất hoặc đã huỷ trước đó");
            }

            // 2. Update trạng thái đơn hàng
            const updatedOrder = await auctionResultRepository.cancelTransaction(order._id, reason, session);

            // 3. Tự động đánh giá -1 cho Bidder (Theo đề bài: Seller huỷ -> phat Seller? Hay Bidder?)
            // ĐỀ BÀI: "Người bán có thể cancel... và đánh giá -1 cho người thắng cuộc"
            // -> Tức là Bidder sai (ko trả tiền) nên Seller huỷ và trừ điểm Bidder.
            
            /* TODO: Mở comment khi đã có Rating Repository
            await ratingRepository.create({
                rater: sellerId,
                rated_user: order.winning_bidder,
                auction_result: order._id,
                rating_type: -1, // Trừ điểm
                comment: `Giao dịch bị huỷ bởi người bán. Lý do: ${reason}`
            }, session);
            */

            return updatedOrder;
        });
    }
}

export const auctionResultService = new AuctionResultService();