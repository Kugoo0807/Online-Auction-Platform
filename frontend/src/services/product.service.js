import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/products`;

class ProductService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
    });
  }

  // Thêm interceptor để tự động gắn token
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Public APIs - không cần token
  async getProductDetail(id) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async getTopEnding() {
    const response = await this.api.get('/top-ending');
    return response.data;
  }

  async getTopPrice() {
    const response = await this.api.get('/top-price');
    return response.data;
  }

  async getTopBidded() {
    const response = await this.api.get('/top-bidded');
    return response.data;
  }

  async searchProducts(keyword, page = 1) {
    const response = await this.api.get('/search', {
      params: { keyword, page }
    });
    return response.data;
  }

  async getProductsByCategory(slug, page = 1) {
    const response = await this.api.get(`/category/${slug}`, {
      params: { page }
    });
    return response.data;
  }

  async getRelatedProducts(slug) {
    const response = await this.api.get(`/category/${slug}/random`);
    return response.data;
  }

  // Seller APIs - cần token
  async createProduct(productData) {
    // QUAN TRỌNG: Không set Content-Type, để browser tự set boundary
    const response = await this.api.post('/create', productData, {
      headers: {
        'Content-Type': undefined // Cho phép browser tự set
      }
    });
    return response.data;
  }

  async getSellerProducts(page = 1) {
    const response = await this.api.get('/seller', {
      params: { page }
    });
    return response.data;
  }
}

export const productService = new ProductService();