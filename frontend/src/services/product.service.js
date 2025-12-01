import api from './api'; // Dùng chung instance api đã cấu hình Refresh Token

class ProductService {

  // --- PUBLIC APIS ---

  // 1. Tìm kiếm sản phẩm
  async searchProducts(keyword, page = 1) {
    try {
      // API của Backend bạn đang sử dụng: /products/search?keyword=...
      const response = await api.get('/products/search', {
        params: {
          keyword,
          page
        }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi searchProducts:", error);
      return { data: [] };
    }
  }

  // 2. Lấy chi tiết sản phẩm
  async getProductDetail(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductDetail:", error);
      throw error;
    }
  }

  // 3. Lấy sản phẩm theo danh mục
  async getProductsByCategory(slug, page = 1) {
    try {
      const response = await api.get(`/products/category/${slug}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi getProductsByCategory:", error);
      return { data: [] };
    }
  }

  // 4. Các API Top sản phẩm
  async getTopEnding() {
    try {
      const response = await api.get('/products/top-ending');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopPrice() {
    try {
      const response = await api.get('/products/top-price');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  async getTopBidded() {
    try {
      const response = await api.get('/products/top-bidded');
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  // 5. Lấy sản phẩm liên quan
  async getRelatedProducts(slug) {
    try {
      const response = await api.get(`/products/category/${slug}/random`);
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }

  // --- SELLER API ---

  async createProduct(productData) {
    try {
      const response = await api.post('/products/create', productData);
      return response.data;
    } catch (error) {
      console.error("Lỗi createProduct:", error);
      throw error;
    }
  }

  async getSellerProducts(page = 1) {
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