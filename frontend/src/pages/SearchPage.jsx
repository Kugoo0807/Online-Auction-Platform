import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ProductSection from '../components/product/ProductSection';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) return;
      
      setLoading(true);
      try {
        console.log(`🔍 Đang tìm kiếm: ${keyword}`);
        const res = await productService.searchProducts(keyword);
        const results = res.data || res || [];
        setProducts(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Lỗi search:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  if (loading && !products.length) {
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
        <div className="mb-12 border-b border-gray-200 pb-6">
          <div className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">TRANG CHỦ</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 font-bold">TÌM KIẾM</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Kết quả cho: <span className="text-blue-600 italic">"{keyword}"</span>
          </h2>
        </div>

        {/* --- NỘI DUNG --- */}
        {products.length > 0 ? (
          <ProductSection products={products} loading={loading} />
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl mb-6">😞 Không tìm thấy sản phẩm nào phù hợp với từ khóa này.</p>
            <Link 
              to="/" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-200"
            >
              Quay về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;