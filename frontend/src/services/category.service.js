import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/categories`;

class CategoryService {
  async getAllCategories() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  async getCategoryDetail(id) {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
}

export const categoryService = new CategoryService();