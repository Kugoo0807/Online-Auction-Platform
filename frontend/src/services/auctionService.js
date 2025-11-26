import api from './api';
import { MOCK_PRODUCTS } from '../data/products';

// true = Dùng Mock Data | false = Dùng API thật
const IS_USE_MOCK = true;

export const auctionService = {
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (slug) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = MOCK_PRODUCTS.filter(p => p.category_slug === slug);
          
          // Tự định nghĩa tên tiếng Việt tương ứng với slug
          const CATEGORY_NAMES = {
            'laptop': 'Laptop',
            'dien-thoai': 'Điện Thoại Di Động',
            'may-tinh-bang': 'Máy Tính Bảng',
            'dong-ho': 'Đồng Hồ',
            'laptop-gaming': 'Laptop Gaming',
            'tu-lanh': 'Tủ Lạnh'
          };

          const prettyName = CATEGORY_NAMES[slug] || slug; 

          resolve({ 
            data: filtered, 
            categoryName: prettyName
          });
        }, 500);
      });
    }
    try {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
      
    } catch (error) {
      // a. Log chi tiết lỗi để debug (Chỉ hiện trong F12 Console)
      console.error(`[API Error] Lỗi khi lấy danh mục ${slug}:`, error);

      if (error.response) {
        if (error.response.status === 404) {
          throw new Error("Danh mục này không tồn tại hoặc đã bị xóa.");
        }
        if (error.response.status === 500) {
          throw new Error("Hệ thống đang bảo trì, vui lòng thử lại sau.");
        }
      } else if (error.request) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
      }

      throw error; 
    }
  },

  // Lấy danh sách sản phẩm active (Trang chủ)
  getAuctions: async () => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
    }
    const response = await api.get('/products/active');
    return response.data;
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (productName) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const result = MOCK_PRODUCTS.filter(p => 
            p.product_name.toLowerCase().includes(productName.toLowerCase())
          );
          resolve(result);
        }, 300);
      });
    }
    const response = await api.get(`/products/search?name=${encodeURIComponent(productName)}`);
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getAuctionById: async (id) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const product = MOCK_PRODUCTS.find(p => p._id === id);
          product ? resolve(product) : reject(new Error("Không tìm thấy sản phẩm"));
        }, 300);
      });
    }
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Đặt giá (Bid)
  placeBid: async (productId, bidAmount) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true, new_price: bidAmount, message: "Đặt giá thành công (Mock)" });
        }, 800);
      });
    }
    const response = await api.post(`/products/${productId}/bid`, { amount: parseFloat(bidAmount) });
    return response.data;
  },

  // Tạo sản phẩm mới
  createAuction: async (auctionData) => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true, message: "Tạo thành công (Mock)" }), 1000);
      });
    }
    const response = await api.post('/products', auctionData);
    return response.data;
  },

  // Lấy sản phẩm sắp kết thúc
  getEndingSoonAuctions: async () => {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        const sorted = [...MOCK_PRODUCTS].sort((a, b) => new Date(a.auction_end_time) - new Date(b.auction_end_time));
        resolve(sorted);
      });
    }
    const response = await api.get('/products/ending-soon');
    return response.data;
  }
};