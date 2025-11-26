import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import ProductGrid from '../components/product/ProductGrid'; 
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  // 1. CALL API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await auctionService.getProductsByCategory(slug);
        setProducts(result.data || []);
        setCategoryName(result.categoryName || slug);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-screen">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-container">
        
        {/* --- HEADER --- */}
        <div className="header-section">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">TRANG CHỦ</Link>
            <span className="breadcrumb-separator"> / </span>
            <span className="category-label">DANH MỤC</span>
          </div>
          
          {/* Tên danh mục */}
          <h2 className="category-title">
            {categoryName}
          </h2>
        </div>

        <ProductGrid products={products} />

      </div>
    </div>
  );
};

export default CategoryPage;