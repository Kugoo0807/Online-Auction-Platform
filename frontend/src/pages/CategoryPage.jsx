import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import ProductGrid from '../components/product/ProductGrid'; 
import './CategoryPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  
  // State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // 2. CALL API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Gọi hàm lấy sản phẩm theo Slug từ categoryService
        const result = await categoryService.getProductsByCategorySlug(slug);
        
        // Cập nhật dữ liệu vào State
        setProducts(result.data || []);
        setCategoryName(result.categoryName || slug);
        setDescription(result.description || ''); 
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setCategoryName("Danh mục không tồn tại");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div> {/* Nếu bạn có class spinner */}
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

          {/* Mô tả danh mục (Hiển thị nếu có) */}
          {description && (
            <p className="category-description">{description}</p>
          )}
        </div>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="no-products">
            <p>Hiện chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CategoryPage;