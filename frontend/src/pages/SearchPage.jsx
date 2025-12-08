import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ProductSection from '../components/product/ProductSection';
import FilterDropdown from '../components/common/FilterDropdown';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  // --- 1. STATE QUẢN LÝ ---
  const [allProducts, setAllProducts] = useState([]); // Dữ liệu gốc từ API
  const [displayProducts, setDisplayProducts] = useState([]); // Dữ liệu hiển thị (sau lọc & cắt trang)
  const [loading, setLoading] = useState(true);

  // State bộ lọc & sắp xếp
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('default');

  // Cấu hình phân trang
  const page = parseInt(searchParams.get('page')) || 1;
  const LIMIT = 12;
  const [totalPages, setTotalPages] = useState(1);

  // --- 2. API & POLLING (Cập nhật dữ liệu) ---
  useEffect(() => {
    const fetchSearchResults = async (isPolling = false) => {
      if (!keyword) return;
      if (!isPolling) setLoading(true);

      try {
        const results = await productService.searchProducts(keyword);
        const activeProducts = (results || []).filter(p => p.auction_status === 'active');
        setAllProducts(activeProducts);
      } catch (error) {
        console.error("Lỗi search:", error);
        if (!isPolling) setAllProducts([]);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchSearchResults(false);

    // Cập nhật ngầm mỗi 5 giây
    const interval = setInterval(() => { fetchSearchResults(true); }, 5000);
    return () => clearInterval(interval);
  }, [keyword]);

  // --- 3. LOGIC LỌC & SẮP XẾP (Core Logic) ---
  const processedList = useMemo(() => {
    let result = [...allProducts];
    const now = Date.now();

    // Lọc theo Giá
    if (priceFilter !== 'ALL') {
      const maxPrice = parseFloat(priceFilter);
      result = result.filter(p => (p.current_highest_price || p.start_price || 0) <= maxPrice);
    }

    // Lọc theo Thời gian (Chỉ lấy sản phẩm chưa kết thúc & trong khoảng thời gian)
    if (timeFilter !== 'ALL') {
      const maxDuration = parseInt(timeFilter) * 24 * 60 * 60 * 1000;
      result = result.filter(p => {
        const timeLeft = new Date(p.auction_end_time).getTime() - now;
        return timeLeft > 0 && timeLeft <= maxDuration;
      });
    }

    // Sắp xếp
    if (sortOrder !== 'default') {
      result.sort((a, b) => {
        const priceA = a.current_highest_price || a.start_price || 0;
        const priceB = b.current_highest_price || b.start_price || 0;
        const timeA = new Date(a.auction_end_time).getTime();
        const timeB = new Date(b.auction_end_time).getTime();

        if (sortOrder === 'price_asc') return priceA - priceB;
        if (sortOrder === 'price_desc') return priceB - priceA;
        if (sortOrder === 'end_time_desc') return timeB - timeA;
        
        // Sắp hết giờ: Ưu tiên cái còn ít thời gian nhất (nhưng chưa hết hạn) lên đầu
        if (sortOrder === 'end_time_asc') {
            const timeLeftA = timeA - now;
            const timeLeftB = timeB - now;
            if (timeLeftA <= 0) return 1; // A hết hạn -> đẩy xuống
            if (timeLeftB <= 0) return -1; // B hết hạn -> đẩy xuống
            return timeA - timeB;
        }
        return 0;
      });
    }
    return result;
  }, [allProducts, priceFilter, timeFilter, sortOrder]);

  // --- 4. XỬ LÝ PHÂN TRANG & HIỂN THỊ ---
  const totalItems = processedList.length;

  // Tính tổng trang & Reset về trang 1 nếu số trang hiện tại vượt quá thực tế
  useEffect(() => {
    const calcPages = Math.ceil(totalItems / LIMIT) || 1;
    setTotalPages(calcPages);

    if (page > calcPages && totalItems > 0) {
      setSearchParams({ keyword, page: 1 });
    }
  }, [processedList, page, totalItems, setSearchParams, keyword]);

  // Cắt dữ liệu (Slice) để hiển thị
  useEffect(() => {
    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    setDisplayProducts(processedList.slice(startIndex, endIndex));
  }, [page, processedList]);

  // Scroll lên đầu khi đổi trang
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page, keyword]);

  // --- 5. HELPER & OPTIONS ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setSearchParams({ keyword, page: newPage });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  const priceOptions = [ { label: "Tất cả", value: "ALL" }, { label: "< 5 triệu", value: 5000000 }, { label: "< 10 triệu", value: 10000000 }, { label: "< 20 triệu", value: 20000000 }, { label: "< 50 triệu", value: 50000000 } ];
  const timeOptions = [ { label: "Mọi lúc", value: "ALL" }, { label: "Trong 24h", value: 1 }, { label: "Trong 3 ngày", value: 3 }, { label: "Trong 7 ngày", value: 7 } ];
  const sortOptions = [ { label: "Mặc định", value: "default" }, { label: "Giá tăng dần", value: "price_asc" }, { label: "Giá giảm dần", value: "price_desc" }, { label: "Sắp hết giờ", value: "end_time_asc" } ];

  // --- RENDER ---
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
        
        {/* Header */}
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
            <p className="text-gray-500 mt-2">Tìm thấy {processedList.length} sản phẩm</p>
          </div>
        </div>

        {/* Toolbar: Filter & Sort (Chỉ hiện khi có dữ liệu gốc) */}
        {allProducts.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <span className="text-gray-700 font-bold mr-2 hidden lg:block self-center">Lọc:</span>
                    <FilterDropdown label="Giá" options={priceOptions} selectedValue={priceFilter} onSelect={(val) => { setPriceFilter(val); setSearchParams({ keyword, page: 1 }); }} />
                    <FilterDropdown label="Thời gian" options={timeOptions} selectedValue={timeFilter} onSelect={(val) => { setTimeFilter(val); setSearchParams({ keyword, page: 1 }); }} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-200">
                    <FilterDropdown label="Sắp xếp" options={sortOptions} selectedValue={sortOrder} onSelect={(val) => { setSortOrder(val); setSearchParams({ keyword, page: 1 }); }} />
                    {(priceFilter !== 'ALL' || timeFilter !== 'ALL' || sortOrder !== 'default') && (
                        <button onClick={() => { setPriceFilter('ALL'); setTimeFilter('ALL'); setSortOrder('default'); setSearchParams({ keyword, page: 1 }); }} className="text-sm text-red-500 hover:underline font-medium ml-auto lg:ml-2 self-center whitespace-nowrap cursor-pointer">Xóa bộ lọc</button>
                    )}
                </div>
            </div>
        )}

        {/* Danh sách & Phân trang */}
        {allProducts.length === 0 ? (
             // Trường hợp 1: Không tìm thấy gì từ API
             <div className="text-center py-16 text-gray-500">
                <p className="text-xl mb-6">😞 Không tìm thấy sản phẩm nào khớp với từ khóa.</p>
                <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg">Quay về trang chủ</Link>
             </div>
        ) : displayProducts.length === 0 ? (
             // Trường hợp 2: Có sản phẩm nhưng bị Filter lọc hết
             <div className="flex justify-center py-8">
                <button onClick={() => { setPriceFilter('ALL'); setTimeFilter('ALL'); setSortOrder('default'); setSearchParams({ keyword, page: 1 }); }} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all cursor-pointer">Đặt lại</button>
             </div>
        ) : (
             // Trường hợp 3: Có dữ liệu hiển thị
             <>
                <ProductSection products={displayProducts} loading={loading} />
                
                {totalPages >= 1 && (
                  <div className="mt-12 flex justify-center items-center space-x-2 select-none">
                    <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page - 1)} disabled={page === 1} className={`px-4 py-2 border rounded-lg transition-colors ${page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Trước</button>
                    {getPaginationItems().map((item, index) => {
                      if (item === '...') return <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                      return <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} key={item} onClick={() => handlePageChange(item)} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${page === item ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{item}</button>;
                    })}
                    <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className={`px-4 py-2 border rounded-lg transition-colors ${page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}>Sau</button>
                  </div>
                )}
             </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;