import api from './api';
import { categories as MOCK_CATEGORIES } from '../data/categories';

const IS_USE_MOCK = false; 

export const categoryService = {

  // 1. Lấy danh sách danh mục
  getAllCategories: async () => {
    if (IS_USE_MOCK) return { data: MOCK_CATEGORIES };

    try {
      const response = await api.get('/categories');
      return response.data.data ? { data: response.data.data } : response.data;
    } catch (error) {
      console.error("Lỗi API Categories:", error);
      throw error; 
    }
  },

  // 2. Lấy chi tiết danh mục
  getCategoryById: async (id) => {
    if (IS_USE_MOCK) return { data: MOCK_CATEGORIES.find(c => c._id === id) };
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi API getCategoryById:", error);
      throw error;
    }
  },

  // 3. Lấy sản phẩm & Thông tin cha con (UPDATED)
  getProductsByCategorySlug: async (slug) => {
    
    if (IS_USE_MOCK) {
       return new Promise((resolve) => {
         resolve({ data: [], categoryName: "Mock", description: "", parentCategory: null });
       });
    }

    // --- REAL API LOGIC ---
    try {
        console.log(`API Only: Đang tải dữ liệu cho danh mục: ${slug}`);

        // BƯỚC 1: Lấy danh sách Danh mục để tìm tên, mô tả và DANH MỤC CHA
        let categoryName = slug;
        let description = "";
        let currentCategory = null;
        let parentCategory = null;
        let allCategories = [];

        try {
            const catRes = await api.get('/categories');
            allCategories = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || []);
            currentCategory = allCategories.find(c => c.slug === slug);
            
            if (currentCategory) {
                categoryName = currentCategory.category_name;
                description = currentCategory.description;

                // --- TÌM CHA ---
                if (currentCategory.parent) {
                    // Kiểm tra xem parent là object (đã populate) hay string ID
                    const parentId = typeof currentCategory.parent === 'object' 
                        ? currentCategory.parent._id 
                        : currentCategory.parent;
                    
                    // Tìm object cha trong danh sách categories đã tải
                    parentCategory = allCategories.find(c => c._id === parentId);
                }
            }
        } catch (e) {
            console.warn("Không lấy được thông tin danh mục, dùng tạm slug.");
        }

        // BƯỚC 2: Gọi API lấy sản phẩm
        let allProducts = [];
        
        try {
            // Ưu tiên 1: Gọi API chuyên dụng
            console.log(`...Gọi API chuyên dụng: /products/category/${slug}`);
            const res = await api.get(`/products/category/${slug}`);
            
            allProducts = res.data.docs || res.data.data || res.data || [];
            
        } catch (err1) {
            console.warn("API chuyên dụng lỗi. Đang thử Fallback...");
            
            // Fallback: Search và filter thủ công
            try {
                const res = await api.get('/products/search?name='); 
                const rawProducts = res.data.data || res.data || [];
                
                if (currentCategory) {
                    const childCats = allCategories.filter(c => c.parent && c.parent._id === currentCategory._id);
                    const validIds = [currentCategory._id, ...childCats.map(c => c._id)];
                    
                    allProducts = rawProducts.filter(p => {
                        const pCatId = p.category_id && typeof p.category_id === 'object' ? p.category_id._id : p.category_id;
                        return validIds.includes(pCatId);
                    });
                } else {
                    allProducts = rawProducts;
                }
            } catch (err2) {
                console.error("Cả API Category và Search đều thất bại.");
                allProducts = []; 
            }
        }

        if (!Array.isArray(allProducts)) allProducts = [];

        return {
            data: allProducts,
            categoryName: categoryName,
            description: description,
            parentCategory: parentCategory
        };

    } catch (error) {
        console.error("Lỗi xử lý category (API Fail):", error);
        return { data: [], categoryName: "Lỗi tải dữ liệu", description: "", parentCategory: null };
    }
  }
};