import { User } from '../../db/schema.js';

export const recalculateAuctionState = async (product, latestBidderId = null, session = null) => {
    const allBids = Array.from(product.auto_bid_map.entries())
        .map(([uid, price]) => ({ userId: uid.toString(), price }));

    if (allBids.length === 0) {
        product.current_highest_price = product.start_price;
        product.current_highest_bidder = null;
        return product;
    }

    // Danh sách bidder đã bị xóa khỏi hệ thống
    const bidderIds = allBids.map(b => b.userId);
    
    const deletedUsers = await User.find({
        _id: { $in: bidderIds },
        is_deleted: true
    }).session(session).select('_id');

    // Lọc bidder
    const deletedSet = new Set(deletedUsers.map(u => u._id.toString()));
    const bannedIds = new Set(product.banned_bidder.map(id => id.toString()));
    const activeIds = allBids.filter(bid => 
        !bannedIds.has(bid.userId) && 
        !deletedSet.has(bid.userId)
    );

    // Sort
    activeIds.sort((a, b) => {
        // Ưu tiên 1: Giá cao hơn
        if (b.price !== a.price) {
            return b.price - a.price;
        }

        // Ưu tiên 2: Xử lí bằng giá (người cũ giữ)
        if (latestBidderId) {
            // Nếu a là thằng mới vào đặt -> a phải đứng sau b -> return 1
            if (a.userId === latestBidderId) return 1;
            
            // Nếu b là thằng mới vào đặt -> b phải đứng sau a -> return -1
            if (b.userId === latestBidderId) return -1;
        }

        return 0;
    });

    const winner = activeIds[0];
    const second = activeIds[1];

    // Tính toán
    const oldWinnerId = product.current_highest_bidder ? product.current_highest_bidder.toString() : null;
    let newPrice = product.start_price;
    let newWinnerId = null;

    if (winner) {
        newWinnerId = winner.userId;
        if (second) {
            if (oldWinnerId && newWinnerId === oldWinnerId) {
                 newPrice = second.price;
            } else {
                const priceWithStep = second.price + product.bid_increment;
                newPrice = Math.min(priceWithStep, winner.price);
            }
        }
        // Nếu sàn chỉ còn 1 người giá hiện tại vẫn là giá ban đầu
    }
    // Nếu sàn không còn người đấu giá hiện tại thì giá vẫn là giá ban đầu

    // Cập nhật ngược vào product
    product.current_highest_price = newPrice;
    product.current_highest_bidder = newWinnerId;

    return product;
};