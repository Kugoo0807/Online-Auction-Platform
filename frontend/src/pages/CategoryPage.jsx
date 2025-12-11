import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import ProductSection from '../components/product/ProductSection';
import FilterDropdown from '../components/common/FilterDropdown'; 

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // --- 1. KHAI BÁO STATE ---
  const [allProducts, setAllProducts] = useState([]); 
  const [displayProducts, setDisplayProducts] = useState([]); 
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryNotFound, setCategoryNotFound] = useState(false);

  const [priceFilter, setPriceFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('default');

  const page = parseInt(searchParams.get('page')) || 1; 
  const LIMIT = 12;
  const [totalPages, setTotalPages] = useState(1);

  // --- 2. GỌI API & CẬP NHẬT TỰ ĐỘNG ---
  useEffect(() => {
    const fetchAllData = async (isPolling = false) => {
      if (!isPolling) setLoading(true); 
      try {
        const result = await categoryService.getProductsByCategorySlug(slug);
        
        // Kiểm tra nếu không có categoryName hoặc là message lỗi
        if (!result.categoryName || result.categoryName === "Lỗi tải dữ liệu" || result.categoryName === slug) {
          // Kiểm tra thêm nếu không có sản phẩm nào
          if (!result.data || result.data.length === 0) {
            setCategoryNotFound(true);
            setLoading(false);
            return;
          }
        }
        
        setCategoryNotFound(false);
        const activeProducts = (result.data || []).filter(p => p.auction_status === 'active');
        setAllProducts(activeProducts);
        setCategoryName(result.categoryName || slug);
        setDescription(result.description || ''); 
        setParentCategory(result.parentCategory || null); 
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setCategoryNotFound(true);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchAllData(false);

    const interval = setInterval(() => { fetchAllData(true); }, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  // --- 3. XỬ LÝ LỌC & SẮP XẾP ---
  const processedList = useMemo(() => {
    let result = [...allProducts];
    const now = Date.now();

    // 1. Filter Giá 
    if (priceFilter !== 'ALL') {
      const maxPrice = parseFloat(priceFilter);
      result = result.filter(p => (p.current_highest_price || p.start_price || 0) <= maxPrice);
    }

    // 2. Filter Thời gian
    if (timeFilter !== 'ALL') {
      const maxDuration = parseInt(timeFilter) * 24 * 60 * 60 * 1000;

      result = result.filter(p => { 
          const endTime = new Date(p.auction_end_time).getTime();
          const timeLeft = endTime - now; // Tính thời gian còn lại

          // ĐIỀU KIỆN: Thời gian còn lại phải > 0 (Chưa hết hạn) 
          // VÀ nhỏ hơn giới hạn bộ lọc
          return timeLeft > 0 && timeLeft <= maxDuration; 
      });
    }

    // 3. Sắp xếp (Sort)
    if (sortOrder !== 'default') {
        result.sort((a, b) => {
            const priceA = a.current_highest_price || a.start_price || 0;
            const priceB = b.current_highest_price || b.start_price || 0;
            
            const timeA = new Date(a.auction_end_time).getTime();
            const timeB = new Date(b.auction_end_time).getTime();

            // sắp xếp
            switch (sortOrder) {
                case 'price_asc': 
                    return priceA - priceB;
                case 'price_desc': 
                    return priceB - priceA;
                case 'end_time_desc': // Thời gian kết thúc xa nhất -> gần nhất
                    return timeB - timeA;
                
                case 'end_time_asc': // Sắp hết giờ
                    // Logic: Cái nào còn ít thời gian nhất (nhưng > 0) thì lên đầu
                    // Nếu dữ liệu chưa lọc "đã hết hạn", ta cần đẩy nó xuống cuối
                    const timeLeftA = timeA - now;
                    const timeLeftB = timeB - now;
                    
                    // Nếu A đã hết hạn, coi như nó rất lớn để đẩy xuống dưới
                    if (timeLeftA <= 0) return 1; 
                    // Nếu B đã hết hạn, coi như nó rất lớn
                    if (timeLeftB <= 0) return -1;

                    return timeA - timeB; // Xếp tăng dần theo thời gian kết thúc

                default:
                    return 0;
            }
        });
    }
    return result;
  }, [allProducts, priceFilter, timeFilter, sortOrder]);

  // --- 4. XỬ LÝ PHÂN TRANG & HIỂN THỊ  ---
  
  const totalItems = processedList.length;
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(totalItems / LIMIT) || 1;
    setTotalPages(calculatedTotalPages);

    if (page > calculatedTotalPages && totalItems > 0) {
        setSearchParams({ page: 1 });
    }
  }, [processedList, page, totalItems, setSearchParams]);

  useEffect(() => {
    const startIndex = (page - 1) * LIMIT;
    const endIndex = startIndex + LIMIT;
    setDisplayProducts(processedList.slice(startIndex, endIndex));
  }, [page, processedList]); 

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, slug]); 

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setSearchParams({ page: newPage });
  };

  const getPaginationItems = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  };

  // --- 5. CẤU HÌNH OPTIONS ---
  const priceOptions = [ { label: "Tất cả", value: "ALL" }, { label: "< 5 triệu", value: 5000000 }, { label: "< 10 triệu", value: 10000000 }, { label: "< 20 triệu", value: 20000000 }, { label: "< 50 triệu", value: 50000000 } ];
  const timeOptions = [ { label: "Mọi lúc", value: "ALL" }, { label: "Trong 24h", value: 1 }, { label: "Trong 3 ngày", value: 3 }, { label: "Trong 7 ngày", value: 7 } ];
  const sortOptions = [ { label: "Mặc định", value: "default" }, { label: "Giá tăng dần", value: "price_asc" }, { label: "Giá giảm dần", value: "price_desc" }, { label: "Sắp hết giờ", value: "end_time_asc" } ];

  if (loading && allProducts.length === 0) return <div className="min-h-screen bg-white flex justify-center items-center text-gray-600 text-xl font-semibold">Đang tải dữ liệu...</div>;

  // Hiển thị khi danh mục không tồn tại
  if (categoryNotFound) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-10 px-4">
        <div className="bg-blue-50 rounded-2xl p-12 max-w-md w-full text-center shadow-sm">
          <div className="text-gray-400 mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 015.646 5.646 9.001 9.001 0 0020.354 15.354z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 11a3 3 0 106 0 3 3 0 00-6 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy danh mục</h2>
          <p className="text-gray-600 mb-8">Danh mục bạn yêu cầu không tồn tại trong hệ thống hoặc đã bị xóa.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8">
          <div className="text-gray-500 text-sm font-medium mb-3 flex items-center flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition">TRANG CHỦ</Link>
            {parentCategory && ( <> <span className="mx-2"> / </span> <Link to={`/category/${parentCategory.slug}`} className="uppercase text-gray-500 hover:text-blue-600 transition">{parentCategory.category_name}</Link> </> )}
            <span className="mx-2"> / </span>
            <span className="uppercase tracking-wider text-blue-600 font-bold">{categoryName}</span>
          </div>
          <h2 className="text-3xl font-extrabold uppercase text-gray-900 tracking-wider border-l-4 border-blue-600 pl-6 leading-none md:text-4xl">{categoryName}</h2>
          {description && <p className="mt-4 text-gray-600">{description}</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <span className="text-gray-700 font-bold mr-2 hidden lg:block self-center">Lọc:</span>
                <FilterDropdown label="Giá" options={priceOptions} selectedValue={priceFilter} onSelect={(val) => { setPriceFilter(val); setSearchParams({ page: 1 }); }} />
                <FilterDropdown label="Thời gian" options={timeOptions} selectedValue={timeFilter} onSelect={(val) => { setTimeFilter(val); setSearchParams({ page: 1 }); }} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-200">
                <FilterDropdown label="Sắp xếp" options={sortOptions} selectedValue={sortOrder} onSelect={(val) => { setSortOrder(val); setSearchParams({ page: 1 }); }} />
                {(priceFilter !== 'ALL' || timeFilter !== 'ALL' || sortOrder !== 'default') && (
                    <button onClick={() => { setPriceFilter('ALL'); setTimeFilter('ALL'); setSortOrder('default'); setSearchParams({ page: 1 }); }} className="text-sm text-red-500 hover:underline font-medium ml-auto lg:ml-2 self-center whitespace-nowrap cursor-pointer">Xóa bộ lọc</button>
                )}
            </div>
        </div>

        <ProductSection title={`${categoryName} (${processedList.length} kết quả)`} products={displayProducts} loading={loading} />

        {displayProducts.length === 0 && !loading && (
            <div className="flex justify-center py-8">
                <button onClick={() => { setPriceFilter('ALL'); setTimeFilter('ALL'); setSortOrder('default'); setSearchParams({ page: 1 }); }} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all cursor-pointer">Đặt lại</button>
            </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2 select-none">
            <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page - 1)} disabled={page === 1} className={`px-4 py-2 border rounded-lg transition-colors ${page === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Trước</button>
            {getPaginationItems().map((item, index) => {
              if (item === '...') return <span key={`dots-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
              return <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} key={item} onClick={() => handlePageChange(item)} className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${page === item ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}>{item}</button>;
            })}
            <button onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"} onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className={`px-4 py-2 border rounded-lg transition-colors ${page === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Sau</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;