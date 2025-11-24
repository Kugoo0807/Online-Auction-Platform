import api from './api';

export const auctionService = {
  // Lấy danh sách sản phẩm đang đấu giá
  getAuctions: async () => {
    const response = await api.get('/products/active');
    return response.data;
  },

  // Tìm sản phẩm theo tên
  searchProducts: async (productName) => {
    const response = await api.get(`/products/search?name=${encodeURIComponent(productName)}`);
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getAuctionById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createAuction: async (auctionData) => {
    const response = await api.post('/products', auctionData);
    return response.data;
  },

  // Đặt giá
  placeBid: async (productId, bidAmount) => {
    const response = await api.post(`/products/${productId}/bid`, { 
      amount: parseFloat(bidAmount) 
    });
    return response.data;
  },

  // Lấy sản phẩm sắp kết thúc
  getEndingSoonAuctions: async () => {
    const response = await api.get('/products/active');
    // Filter trên frontend hoặc backend có endpoint riêng
    return response.data;
  }
};