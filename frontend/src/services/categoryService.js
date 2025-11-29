import api from './api';
import { categories as MOCK_CATEGORIES, MOCK_PRODUCTS } from '../data/categories';

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

  // 3. Lấy sản phẩm (CHỈ DÙNG API - KHÔNG FALLBACK VỀ MOCK)
  getProductsByCategorySlug: async (slug) => {
    
    if (IS_USE_MOCK) {
       return new Promise((resolve) => {
         resolve({ data: [], categoryName: "Mock", description: "" });
       });
    }

    // --- REAL API LOGIC ---
    try {
        console.log(`API Only: Đang tải dữ liệu cho danh mục: ${slug}`);

        // BƯỚC 1: Lấy danh sách Danh mục để tìm tên và thông tin hiển thị
        let categoryName = slug;
        let description = "";
        let currentCategory = null;
        let allCategories = [];

        try {
            const catRes = await api.get('/categories');
            allCategories = Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || []);
            currentCategory = allCategories.find(c => c.slug === slug);
            
            if (currentCategory) {
                categoryName = currentCategory.category_name;
                description = currentCategory.description;
            }
        } catch (e) {
            console.warn("Không lấy được thông tin danh mục, dùng tạm slug.");
        }

        // BƯỚC 2: Gọi API lấy sản phẩm (Gọi đúng endpoint backend cung cấp)
        let allProducts = [];
        
        try {
            // Ưu tiên 1: Gọi API chuyên dụng theo danh mục
            // Route: router.get('/category/:slug', ...) -> URL: /api/products/category/:slug
            console.log(`...Gọi API chuyên dụng: /products/category/${slug}`);
            const res = await api.get(`/products/category/${slug}`);
            
            allProducts = res.data.docs || res.data.data || res.data || [];
            
            console.log(`API chuyên dụng trả về ${allProducts.length} sản phẩm.`);

        } catch (err1) {
            console.warn("API chuyên dụng lỗi (404/500). Đang thử API /search (Fallback)...");
            
            // Fallback: Nếu API trên lỗi, dùng API Search lấy hết rồi tự lọc
            try {
                // Route: router.get('/search', ...) -> URL: /api/products/search
                const res = await api.get('/products/search?name='); 
                const rawProducts = res.data.data || res.data || [];
                
                if (currentCategory) {
                    // Tìm cả danh mục con
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
            description: description
        };

    } catch (error) {
        console.error("Lỗi xử lý category (API Fail):", error);
        return { data: [], categoryName: "Lỗi tải dữ liệu", description: "" };
    }
  }
};