import api from './api';
import { MOCK_PRODUCTS } from '../data/categories';
const IS_USE_MOCK = false;

class ProductService {

  // --- PUBLIC APIS ---

  // 1. Tìm kiếm sản phẩm (Đã thêm Mock Logic)
  async searchProducts(keyword, page = 1, limit = 12) {
    // --- MOCK MODE ---
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`[MOCK] Tìm kiếm: "${keyword}" (Lấy tất cả)`);
          
          const lowerKeyword = (keyword || "").toLowerCase();
          
          // Lọc tìm kiếm giả lập
          const filtered = MOCK_PRODUCTS.filter(p => 
            p.product_name.toLowerCase().includes(lowerKeyword)
          );

          // Trả về hết, KHÔNG CẮT ở đây
          resolve(filtered); 
        }, 500);
      });
    }

    // --- REAL API MODE ---
    try {
      // API của Backend: /products/search?keyword=...
      const response = await api.get('/products/search', {
        params: {
          keyword, // Tham số query chính
        }
      });
      
      // Chuẩn hóa dữ liệu trả về để Frontend không bị lỗi
      const data = response.data.data || response.data || [];
      
      return Array.isArray(data) ? data : [];

    } catch (error) {
      console.error("Lỗi searchProducts:", error);
      return [];
    }
  }

  // 2. Lấy chi tiết sản phẩm
  async getProductDetail(id) {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        const product = MOCK_PRODUCTS.find(p => p._id === id);
        resolve({ data: product });
      });
    }

    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductDetail:", error);
      throw error;
    }
  }

  // 3. Lấy sản phẩm theo danh mục
  async getProductsByCategory(slug, page = 1, limit = 12) {
    if (IS_USE_MOCK) {
      return new Promise((resolve) => {
        const filtered = MOCK_PRODUCTS.filter(p => p.category_slug === slug);
        const startIndex = (page - 1) * limit;
        const docs = filtered.slice(startIndex, startIndex + limit);
        
        resolve({
           data: docs,
           docs: docs,
           totalDocs: filtered.length,
           totalPages: Math.ceil(filtered.length / limit),
           page
        });
      });
    }

    try {
      const response = await api.get(`/products/category/${slug}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductsByCategory:", error);
      return { data: [] };
    }
  }

  // 4. Các API Top sản phẩm
  async getTopEnding() {
    if (IS_USE_MOCK) return { data: MOCK_PRODUCTS.slice(0, 4) };
    try {
      const response = await api.get('/products/top-ending');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopPrice() {
    if (IS_USE_MOCK) return { data: [...MOCK_PRODUCTS].reverse().slice(0, 4) };
    try {
      const response = await api.get('/products/top-price');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopBidded() {
    if (IS_USE_MOCK) return { data: MOCK_PRODUCTS.slice(5, 9) };
    try {
      const response = await api.get('/products/top-bidded');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  // 5. Lấy sản phẩm liên quan
  async getRelatedProducts(slug) {
    if (IS_USE_MOCK) {
        const related = MOCK_PRODUCTS.filter(p => p.category_slug === slug).slice(0, 4);
        return { data: related };
    }
    try {
      const response = await api.get(`/products/category/${slug}/random`);
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  // --- SELLER API ---

  async createProduct(productData) {
    if (IS_USE_MOCK) {
        console.log("Mock Create:", productData);
        return { success: true, message: "Tạo thành công (Mock)" };
    }
    try {
      const response = await api.post('/products/create', productData);
      return response.data;
    } catch (error) {
      console.error("Lỗi createProduct:", error);
      throw error;
    }
  }

  async getSellerProducts(page = 1) {
    if (IS_USE_MOCK) return { data: MOCK_PRODUCTS.slice(0, 5) };
    try {
      const response = await api.get('/products/seller', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMinValidPrice(productId, userId) {
    if (IS_USE_MOCK) return { minPrice: 1000000 };
    try {
      const response = await api.get(`/products/${productId}/min-price`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getMinValidPrice:", error);
      throw error;
    }
  }
}

export const productService = new ProductService();