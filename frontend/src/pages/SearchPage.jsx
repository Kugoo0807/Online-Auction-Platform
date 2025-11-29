import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productService } from '../services/product.service';
import ProductGrid from '../components/product/ProductGrid';
import './SearchPage.css';

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

  return (
    <div className="search-page">
      <div className="search-container">
        
        {/* --- HEADER --- */}
        <div className="search-header">
          <div className="breadcrumb">
            <Link to="/">TRANG CHỦ</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="search-label">TÌM KIẾM</span>
          </div>
          
          <h2 className="search-title">
            Kết quả cho: <span className="highlight-keyword">"{keyword}"</span>
          </h2>
        </div>

        {/* --- NỘI DUNG --- */}
        {loading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
            Đang tìm kiếm sản phẩm...
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="no-results">
            <p>😞 Không tìm thấy sản phẩm nào phù hợp với từ khóa này.</p>
            <Link to="/" className="back-home-btn">
              Quay về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;