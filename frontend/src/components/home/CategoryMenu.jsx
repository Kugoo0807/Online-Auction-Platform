import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';

export default function CategoryMenu({ show, onHover, onClickCategory }) {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await categoryService.getAllCategories();
        if (res && res.data) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi menu:", error);
      }
    };
    fetchData();
  }, []);

  const rootCategories = categories?.filter(c => !c.parent) || [];
  
  const getChildCategories = (parentId) => {
    return categories?.filter(c => c.parent && c.parent._id === parentId) || [];
  };

  const handleCategoryClick = (slug) => {
    navigate(`/category/${slug}`);
    if (onClickCategory) onClickCategory();
  };

  if (!show) return null;

  return (
    <div 
      style={{ 
        position: 'absolute', top: '100%', left: '0', 
        width: '600px', backgroundColor: '#FFFFFF', 
        display: 'flex', flexWrap: 'wrap', gap: '30px', 
        padding: '25px', borderRadius: '15px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)', zIndex: 1000, 
        border: '1px solid #E9ECEF' 
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {rootCategories.map((rootCat) => {
        const subCats = getChildCategories(rootCat._id);
        return (
          <div key={rootCat._id} style={{ minWidth: '250px', marginBottom: '15px' }}>
            <h4 
              style={{ margin: '0 0 12px 0', color: '#2c3e50', borderBottom: '2px solid #3498db', cursor: 'pointer' }}
              onClick={() => handleCategoryClick(rootCat.slug)}
            >
              {rootCat.category_name}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {subCats.map(sub => (
                <span 
                  key={sub._id} 
                  style={{ cursor: 'pointer', color: '#555', fontSize: '14px' }}
                  onClick={() => handleCategoryClick(sub.slug)}
                >
                  • {sub.category_name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}