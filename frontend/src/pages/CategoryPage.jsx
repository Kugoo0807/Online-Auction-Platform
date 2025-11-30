import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import ProductSection from '../components/product/ProductSection';

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

  // Thêm logic hiển thị Loading State (nếu cần)
  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center text-gray-600 text-xl font-semibold">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-12">
          {/* Breadcrumb */}
          <div className="text-gray-500 text-sm font-medium mb-3">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition">TRANG CHỦ</Link>
            <span className="mx-2"> / </span>
            <span className="uppercase tracking-wider text-gray-400">DANH MỤC</span>
          </div>
          
          {/* Tên danh mục */}
          <h2 className="text-3xl font-extrabold uppercase text-gray-900 tracking-wider border-l-4 border-blue-600 pl-6 leading-none md:text-4xl">
            {categoryName}
          </h2>

          {/* Mô tả danh mục */}
          {description && (
            <p className="mt-4 text-gray-600">{description}</p>
          )}
        </div>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <ProductSection
          title={categoryName}
          products={products}
          loading={loading}
        />

      </div>
    </div>
  );
};

export default CategoryPage;