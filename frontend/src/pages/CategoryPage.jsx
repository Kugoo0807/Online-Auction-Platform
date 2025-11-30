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
  const [parentCategory, setParentCategory] = useState(null);
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
        setParentCategory(result.parentCategory || null); 
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setCategoryName("Danh mục không tồn tại");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  // Hiển thị Loading State
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
          
          {/* --- BREADCRUMB (THANH ĐIỀU HƯỚNG) --- */}
          <div className="text-gray-500 text-sm font-medium mb-3 flex items-center flex-wrap">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition">TRANG CHỦ</Link>
            
            {/* Logic hiển thị: Nếu có cha -> Hiện cha / Hiện con. Nếu không -> Hiện con */}
            {parentCategory ? (
                <>
                    <span className="mx-2"> / </span>
                    <Link 
                        to={`/category/${parentCategory.slug}`}
                        className="uppercase text-gray-500 hover:text-blue-600 transition"
                    >
                        {parentCategory.category_name}
                    </Link>
                </>
            ) : null}

            <span className="mx-2"> / </span>
            <span className="uppercase tracking-wider text-blue-600 font-bold">
                {categoryName}
            </span>
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