export const recalculateAuctionState = (product) => {
    const allBids = Array.from(product.auto_bid_map.entries())
        .map(([uid, price]) => ({ userId: uid.toString(), price }));

    // Lọc bidder
    const bannedIds = new Set(product.banned_bidder.map(id => id.toString()));
    const activeIds = allBids.filter(bid => !bannedIds.has(bid.userId));

    // Sort
    activeBids.sort((a, b) => b.price - a.price);

    const winner = activeIds[0];
    const second = activeIds[1];

    // Tính toán
    let newPrice = product.start_price;
    let newWinner = null;

    if (winner) {
        newWinner = winner.userId;
        if (second) {
            const priceToBeat = second.price + product.bid_increment;
            newPrice = Math.min(priceToBeat, winner.price);
        }
        // Nếu sàn chỉ còn 1 người giá hiện tại vẫn là giá ban đầu
    }
    // Nếu sàn không còn người đấu giá hiện tại thì giá vẫn là giá ban đầu

    // Cập nhật ngược vào product
    product.current_highest_price = newPrice;
    product.current_highest_bidder = newWinner;

    return product;
};