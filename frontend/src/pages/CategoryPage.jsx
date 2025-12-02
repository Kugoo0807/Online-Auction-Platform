import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import ProductSection from '../components/product/ProductSection';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // --- STATE DỮ LIỆU ---
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CONFIG PHÂN TRANG ---
  const page = parseInt(searchParams.get('page')) || 1; 
  const LIMIT = 12;
  const [totalPages, setTotalPages] = useState(1);

  // --- GỌI API & POLLING ---
  useEffect(() => {
    // Thêm tham số isPolling để xử lý Loading UI "im lặng"
    const fetchAllData = async (isPolling = false) => {
      
      if (!isPolling) setLoading(true);

      try {
        const result = await categoryService.getProductsByCategorySlug(slug);
        
        // Lưu toàn bộ dữ liệu vào state gốc
        setAllProducts(result.data || []);
        
        setCategoryName(result.categoryName || slug);
        setDescription(result.description || ''); 
        setParentCategory(result.parentCategory || null); 

        // Tính tổng số trang
        const total = Math.ceil((result.data?.length || 0) / LIMIT);
        setTotalPages(total > 0 ? total : 1);

      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        if (!isPolling) setCategoryName("Danh mục không tồn tại");
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchAllData(false);

    // Thiết lập Polling: Gọi lại mỗi 5 giây
    const interval = setInterval(() => {
        fetchAllData(true); 
    }, 5000);

    return () => clearInterval(interval);

  }, [slug]);


  // --- XỬ LÝ SCROLL ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);


  // --- SLICE ---
  useEffect(() => {
    const total = Math.ceil(allProducts.length / LIMIT);
    setTotalPages(total > 0 ? total : 1);

    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    
    const currentSlice = allProducts.slice(startIndex, endIndex);
    
    setDisplayProducts(currentSlice);

  }, [page, allProducts]);


  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage });
    }
  };

  // --- LOGIC TẠO DANH SÁCH TRANG RÚT GỌN ---
  const getPaginationItems = () => {
    // Nếu tổng số trang ít (<= 7), hiển thị tất cả
    if (totalPages <= 7) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }

    // Nếu đang ở những trang đầu (vd: 1, 2, 3, 4)
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    // Nếu đang ở những trang cuối
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // Nếu đang ở giữa
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // --- LOADING UI ---
  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center text-gray-600 text-xl font-semibold">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & BREADCRUMB --- */}
        <div className="mb-12">
          <div className="text-gray-500 text-sm font-medium mb-3 flex items-center flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition">TRANG CHỦ</Link>
            
            {parentCategory && (
                <>
                    <span className="mx-2"> / </span>
                    <Link to={`/category/${parentCategory.slug}`} className="uppercase text-gray-500 hover:text-blue-600 transition">
                        {parentCategory.category_name}
                    </Link>
                </>
            )}

            <span className="mx-2"> / </span>
            <span className="uppercase tracking-wider text-blue-600 font-bold">{categoryName}</span>
          </div>
          
          <h2 className="text-3xl font-extrabold uppercase text-gray-900 tracking-wider border-l-4 border-blue-600 pl-6 leading-none md:text-4xl">
            {categoryName}
          </h2>

          {description && <p className="mt-4 text-gray-600">{description}</p>}
        </div>

        {/* --- LIST SẢN PHẨM --- */}
        <ProductSection
          title={`${categoryName} (Tổng ${allProducts.length} sản phẩm)`} 
          products={displayProducts} 
          loading={loading}
        />

        {/* --- PHÂN TRANG --- */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2 select-none">
            <button
              onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Trước
            </button>

            {getPaginationItems().map((item, index) => {
              if (item === '...') return <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
              return (
                <button
                  onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                    page === item ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold' : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Sau
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;