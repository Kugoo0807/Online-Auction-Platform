import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ProductSection from '../components/product/ProductSection';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  // --- STATE DỮ LIỆU ---
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CONFIG ---
  const page = parseInt(searchParams.get('page')) || 1;
  const LIMIT = 12;
  const [totalPages, setTotalPages] = useState(1);


  // --- 1. GỌI API & POLLING ---
  useEffect(() => {
    const fetchSearchResults = async (isPolling = false) => {
      if (!keyword) return;
      
      // Chỉ hiện loading xoay vòng lần đầu
      if (!isPolling) setLoading(true);

      try {
        // Gọi API lấy TẤT CẢ kết quả
        const results = await productService.searchProducts(keyword);
        
        // Cập nhật State gốc
        setAllProducts(results || []);

      } catch (error) {
        console.error("Lỗi search:", error);
        if (!isPolling) setAllProducts([]);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    // Gọi lần đầu
    fetchSearchResults(false);

    // Thiết lập Polling: Gọi lại mỗi 5 giây
    const interval = setInterval(() => {
        fetchSearchResults(true); 
    }, 5000);

    return () => clearInterval(interval);
  }, [keyword]);


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
      setSearchParams({ keyword: keyword, page: newPage });
    }
  };

  // --- LOGIC RÚT GỌN TRANG ---
  const getPaginationItems = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  if (loading && allProducts.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center bg-white text-gray-600">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <span className="text-lg font-medium">Đang tìm kiếm...</span>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">TRANG CHỦ</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 font-bold">TÌM KIẾM</span>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Kết quả cho: <span className="text-blue-600 italic">"{keyword}"</span>
            </h2>
            <p className="text-gray-500 mt-2">Tìm thấy {allProducts.length} sản phẩm</p>
          </div>
        </div>

        {/* --- NỘI DUNG --- */}
        {allProducts.length > 0 ? (
          <>
            <ProductSection products={displayProducts} loading={loading} />

            {/* --- PHÂN TRANG --- */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2 select-none">
                <button
                  onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
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
                        page === item ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-50'
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
                    page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-6">😞 Không tìm thấy sản phẩm nào.</p>
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg">
              Quay về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;