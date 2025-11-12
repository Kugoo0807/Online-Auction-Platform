import { useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import ProductSection from './ProductSection'
import { categories } from './data/categories'
import { products } from './data/products'


//Thanh tìm kiếm
function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    alert("Searching for: " + query);
  };
}

export default function App() {
  const [showCategories, setShowCategories] = useState(false)

  return (
    <>
      <div>
        <div style={{ backgroundColor: 'var(--color-primary)', padding: '20px', display: 'flex' }}
        >
          {/* Nút Danh mục */}
          <button
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
            style={{
              backgroundColor: '#F8F9FA',
              fontSize: '20px',
              /*fontWeight: 'bold',*/
              border: 'none',
              width: '10%',
              cursor: 'pointer',
              color: '#1E1E1E'
            }}
          >
            📂 Danh mục
          </button>

          {/* Thanh tìm kiếm */}
          <div style={{ display: 'flex' }}>
            <input
              type="text"
              placeholder="Tìm kiếm"
              onFocus={(e) => (e.target.placeholder = '')}
              onBlur={(e) => (e.target.placeholder = 'Tìm kiếm')}
              style={{
                width: '700px',
                padding: '15px 15px',
                marginLeft: '10px',
                fontSize: '20px',
                border: '2px solid #ccc',
                borderRadius: '20px 0 0 20px',
                outline: 'none'
              }}
            />
            <button
              style={{
                backgroundColor: '#004E92',
                color: 'white',
                border: 'none',
                borderRadius: '0 20px 20px 0',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              🔍
            </button>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            {/*Nút đăng nhập và đăng kí*/}
            <button
              style={{
                marginRight: '10px',
                backgroundColor: '#F8F9FA',
                color: '#1E1E1E',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '20px',
              }}>
              Đăng nhập
            </button>

            <button
              style={{
                backgroundColor: '#F8F9FA',
                color: '#1E1E1E',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '20px',
              }}>
              Đăng ký
            </button>
          </div>
        </div>
        <div>
          {/* Hiện/ẩn danh sách category */}
          {showCategories && (
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '30px',
              width: '50%',
              backgroundColor: '#F8F9FA',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '40px',
              justifyContent: 'center',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}>
              {categories.map((cat, index) => (
                <div key={index} className="category" style={{ position: 'relative' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {cat.name}
                  </span>

                  <div className="submenu">
                    {cat.subcategories.map((sub, i) => (
                      <div key={i}>
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách sản phẩm */}
        <ProductSection
          title="Top 5 sản phẩm gần kết thúc"
          products={products.slice(0, 5)}
        />

        <ProductSection
          title="Top 5 sản phẩm có nhiều lượt ra giá nhất"
          products={products.slice(0, 5)} // sau này thay bằng mảng thực tế
        />

        <ProductSection
          title="Top 5 sản phẩm có giá cao nhất"
          products={products.slice(0, 5)} // hoặc sắp xếp rồi lấy 5
        />

        {/*Thông tin chung*/}
        <div
        style = {{
          backgroundColor: '#938a8aff',
          width: '100%',
          height: '200px'
        }}
        >
          <div>
            
          </div>
        </div>
      </div >
    </>
  )
}
