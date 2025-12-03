import api from './api';

export const categoryService = {

  // 1. Lấy danh sách danh mục
  getAllCategories: async () => {

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
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi API getCategoryById:", error);
      throw error;
    }
  },

  // 3. Lấy sản phẩm & Thông tin cha con
  getProductsByCategorySlug: async (slug) => {
    // --- REAL API LOGIC ---
    try {
        console.log(`API Only: Đang tải TOÀN BỘ dữ liệu cho danh mục: ${slug}`);

        // BƯỚC 1: Lấy thông tin danh mục (Giữ nguyên logic cũ)
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
                if (currentCategory.parent) {
                    const parentId = typeof currentCategory.parent === 'object' 
                        ? currentCategory.parent._id 
                        : currentCategory.parent;
                    parentCategory = allCategories.find(c => c._id === parentId);
                }
            }
        } catch (e) {
            console.warn("Không lấy được thông tin danh mục, dùng tạm slug.");
        }

        // BƯỚC 2: Gọi API lấy TOÀN BỘ sản phẩm
        let allProducts = [];
        
        try {
            const res = await api.get(`/products/category/${slug}`);
            allProducts = res.data.data || [];

        } catch (err1) {
            try {
                const res = await api.get('/products/search?name='); 
                const rawProducts = res.data.data || res.data || [];
                
                let filteredProducts = rawProducts;
                if (currentCategory) {
                    const childCats = allCategories.filter(c => c.parent && c.parent._id === currentCategory._id);
                    const validIds = [currentCategory._id, ...childCats.map(c => c._id)];
                    filteredProducts = rawProducts.filter(p => {
                        const pCatId = p.category_id && typeof p.category_id === 'object' ? p.category_id._id : p.category_id;
                        return validIds.includes(pCatId);
                    });
                }
                allProducts = filteredProducts;

            } catch (err2) {
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
        return { 
            data: [], 
            categoryName: "Lỗi tải dữ liệu", 
            description: "", 
            parentCategory: null 
        };
    }
  }
};