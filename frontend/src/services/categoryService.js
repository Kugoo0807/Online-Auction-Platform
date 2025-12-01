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

  // 3. Lấy sản phẩm & Thông tin cha con
  getProductsByCategorySlug: async (slug, page = 1, limit = 12) => {
    
    if (IS_USE_MOCK) {
       return new Promise((resolve) => {
         // 1. Tìm thông tin danh mục
         const currentCategory = MOCK_CATEGORIES.find(c => c.slug === slug);
         let parentCategory = null;
         
         if (currentCategory && currentCategory.parent) {
             const parentId = typeof currentCategory.parent === 'object' ? currentCategory.parent._id : currentCategory.parent;
             parentCategory = MOCK_CATEGORIES.find(c => c._id === parentId);
         }

         // 2. Lọc sản phẩm theo Slug
         const filteredProducts = MOCK_PRODUCTS.filter(p => p.category_slug === slug);

         // 3. Giả lập phân trang
         const startIndex = (page - 1) * limit;
         const endIndex = startIndex + limit;
         const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

         // 4. Trả về kết quả
         resolve({ 
            data: paginatedProducts, 
            pagination: { 
                totalDocs: filteredProducts.length, 
                totalPages: Math.ceil(filteredProducts.length / limit), 
                page: page,
                limit: limit
            }, 
            categoryName: currentCategory ? currentCategory.category_name : "Mock Category", 
            description: currentCategory ? currentCategory.description : "Mô tả giả lập", 
            parentCategory: parentCategory 
        });
       });
    }

    // --- REAL API LOGIC ---
    try {
        console.log(`API Only: Đang tải dữ liệu cho danh mục: ${slug} | Page: ${page}`);

        // BƯỚC 1: Lấy thông tin danh mục (Tên, Mô tả, Cha)
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

                // Tìm Cha
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

        // BƯỚC 2: Gọi API lấy sản phẩm
        let allProducts = [];
        let paginationInfo = {
            totalDocs: 0,
            totalPages: 1,
            page: page,
            limit: limit
        };
        
        try {
            // Ưu tiên 1: Gọi API chuyên dụng với params
            console.log(`...Gọi API chuyên dụng: /products/category/${slug}`);
            
            // Sử dụng params object của axios để tự động nối chuỗi query (?page=1&limit=12)
            const res = await api.get(`/products/category/${slug}`, {
                params: {
                    page: page,
                    limit: limit
                }
            });
            
            // Xử lý dữ liệu trả về
            if (res.data.docs) {
                allProducts = res.data.docs;
                paginationInfo = {
                    totalDocs: res.data.totalDocs,
                    totalPages: res.data.totalPages,
                    page: res.data.page,
                    limit: res.data.limit
                };
            } else {
                // Trường hợp API trả về mảng phẳng
                allProducts = res.data.data || res.data || [];
            }
            
        } catch (err1) {
            console.warn("API chuyên dụng lỗi. Đang thử Fallback...");
            
            // Fallback: Search và filter thủ công
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
                
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                allProducts = filteredProducts.slice(startIndex, endIndex);
                
                paginationInfo = {
                    totalDocs: filteredProducts.length,
                    totalPages: Math.ceil(filteredProducts.length / limit),
                    page: page,
                    limit: limit
                };

            } catch (err2) {
                console.error("Cả API Category và Search đều thất bại.");
                allProducts = []; 
            }
        }

        if (!Array.isArray(allProducts)) allProducts = [];

        return {
            data: allProducts,
            pagination: paginationInfo,
            categoryName: categoryName,
            description: description,
            parentCategory: parentCategory
        };

    } catch (error) {
        console.error("Lỗi xử lý category (API Fail):", error);
        return { 
            data: [], 
            pagination: { totalDocs: 0, totalPages: 0, page: 1 },
            categoryName: "Lỗi tải dữ liệu", 
            description: "", 
            parentCategory: null 
        };
    }
  }
};