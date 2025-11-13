// Giả lập database
const mockProducts = [
    {
        id: 1,
        name: "iPhone 11",
        currentPrice: 10000000,
        highestBidder: "****Khoa",
        buyNowPrice: 15000000,
        postedDate: "2025-10-27T10:00:00Z",
        endDate: "2025-11-15T18:00:00Z",
        bidCount: 5
    },
    {
        id: 2,
        name: "Laptop Dell XPS 13",
        currentPrice: 18500000,
        highestBidder: "****Tuan",
        buyNowPrice: null,
        postedDate: "2025-10-28T14:30:00Z",
        endDate: "2025-11-14T22:00:00Z",
        bidCount: 8
    }
];


const findAllProducts = async () => {
    return mockProducts;
};

const findProductById = async (id) => {
    const product = mockProducts.find(p => p.id === parseInt(id));
    return product;
};

module.exports = {
    findAllProducts,
    findProductById
};