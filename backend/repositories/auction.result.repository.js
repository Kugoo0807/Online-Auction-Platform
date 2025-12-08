import { AuctionResult } from '../../db/schema.js';

class AuctionResultRepository {
    async create(resultData, session = null) {
        const result = new AuctionResult(resultData);
        return await result.save({ session });
    }

    async findById(id) {
        return await AuctionResult.findById(id)
            .populate('product', 'product_name thumbnail')
            .populate('winning_bidder', 'full_name email rating_score rating_count')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findByProduct(productId) {
        return await AuctionResult.findOne({ product: productId })
            .populate('winning_bidder', 'full_name email rating_score rating_count')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findByWinner(userId) {
        return await AuctionResult.find({ winning_bidder: userId })
            .sort({ createdAt: -1 })
            .populate('product', 'product_name thumbnail')
            .populate('seller', 'full_name email rating_score rating_count');
    }

    async findBySeller(userId) {
        return await AuctionResult.find({ seller: userId })
            .sort({ createdAt: -1 })
            .populate('product', 'product_name thumbnail')
            .populate('winning_bidder', 'full_name email rating_score rating_count');
    }

    async existPendingTransaction(userId) {
        return await AuctionResult.exists({
            $or: [
                { seller: userId },
                { winning_bidder: userId }
            ],
            status: { $nin: ['completed', 'cancelled'] }
        });
    }

    // Người mua thanh toán -> Chờ vận chuyển
    async updatePaymentInfo(id, address, paymentProofUrl) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                shipping_address: address,
                payment_proof: paymentProofUrl,
                status: 'pending_shipment'
            },
            { new: true }
        );
    }

    // Người bán gửi hàng -> Đang giao
    async updateShipmentInfo(id, shippingProofUrl) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                shipping_proof: shippingProofUrl,
                status: 'shipping'
            },
            { new: true }
        );
    }

    // Người mua xác nhận -> Hoàn tất
    async completeTransaction(id) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true }
        );
    }

    // Huỷ giao dịch
    async cancelTransaction(id, reason, session = null) {
        return await AuctionResult.findByIdAndUpdate(
            id,
            { 
                status: 'cancelled',
                cancellation_reason: reason,
                cancelled_at: new Date()
            },
            { new: true, session }
        );
    }
}

export const auctionResultRepository = new AuctionResultRepository();