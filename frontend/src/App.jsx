import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './App.css'
import ProductSection from './components/ProductSection'
import { categories } from './data/categories'
import { products } from './data/products'
import { useAuth } from './context/AuthContext'

// Thanh tìm kiếm component
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = 'Tìm kiếm sản phẩm...')}
        style={{
          width: '700px',
          padding: '15px 20px',
          marginLeft: '10px',
          fontSize: '18px',
          border: '2px solid #ccc',
          borderRadius: '25px 0 0 25px',
          outline: 'none',
          transition: 'all 0.3s ease'
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          backgroundColor: '#004E92',
          color: 'white',
          border: 'none',
          borderRadius: '0 25px 25px 0',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 25px',
          transition: 'background-color 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#003366'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#004E92'}
      >
        🔍
      </button>
    </div>
  );
}

export default function App() {
  const [showCategories, setShowCategories] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (query) => {
    // TODO: Implement search functionality
    console.log('Searching for:', query)
    // navigate(`/search?q=${encodeURIComponent(query)}`)
    alert(`Tìm kiếm: ${query}`)
  }

  const handleCategoryHover = (show) => {
    setShowCategories(show)
  }

  const handleCategoryClick = (categoryName) => {
    // TODO: Navigate to category page
    console.log('Selected category:', categoryName)
    setShowCategories(false)
  }

  return (
    <>
      <div>
        {/* Header Navigation */}
        <div style={{ 
          backgroundColor: 'var(--color-primary)', 
          padding: '15px 20px', 
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Logo/Brand */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: 'bold',
              marginRight: '20px'
            }}
          >
            AuctionHub
          </Link>

          {/* Nút Danh mục */}
          <div 
            onMouseEnter={() => handleCategoryHover(true)}
            onMouseLeave={() => handleCategoryHover(false)}
            style={{ position: 'relative' }}
          >
            <button
              style={{
                backgroundColor: '#F8F9FA',
                fontSize: '18px',
                border: 'none',
                padding: '12px 20px',
                cursor: 'pointer',
                color: '#1E1E1E',
                borderRadius: '25px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E9ECEF'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F8F9FA'}
            >
              📂 Danh mục
            </button>

            {/* Dropdown Categories */}
            {showCategories && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  width: '600px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '30px',
                  justifyContent: 'space-between',
                  padding: '25px',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  border: '1px solid #E9ECEF'
                }}
                onMouseEnter={() => handleCategoryHover(true)}
                onMouseLeave={() => handleCategoryHover(false)}
              >
                {categories.map((category, index) => (
                  <div 
                    key={index} 
                    className="category" 
                    style={{ 
                      minWidth: '250px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      color: 'var(--color-primary)',
                      fontSize: '16px',
                      fontWeight: '600',
                      paddingBottom: '8px',
                      borderBottom: '2px solid var(--color-accent)'
                    }}>
                      {category.name}
                    </h4>
                    <div className="submenu">
                      {category.subcategories.map((sub, i) => (
                        <div 
                          key={i}
                          style={{
                            padding: '6px 0',
                            color: '#555',
                            fontSize: '14px',
                            transition: 'color 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--color-accent)';
                            e.target.style.fontWeight = '500';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#555';
                            e.target.style.fontWeight = 'normal';
                          }}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thanh tìm kiếm */}
          <div style={{ margin: '0 20px', flex: 1 }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* User Navigation */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user ? (
              /* Hiển thị khi đã đăng nhập */
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/create-auction">
                  <button style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '10px 20px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d2694d'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}
                  >
                    ➕ Tạo đấu giá
                  </button>
                </Link>
                
                <Link to="/dashboard">
                  <button style={{
                    backgroundColor: '#F8F9FA',
                    color: '#1E1E1E',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '10px 20px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#E9ECEF'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#F8F9FA'}
                  >
                    👤 {user.name || user.email}
                  </button>
                </Link>
                
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#F8F9FA',
                    color: '#1E1E1E',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '10px 20px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#F8F9FA';
                    e.target.style.color = '#1E1E1E';
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              /* Hiển thị khi chưa đăng nhập */
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/login">
                  <button style={{
                    backgroundColor: '#F8F9FA',
                    color: '#1E1E1E',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '10px 25px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#E9ECEF'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#F8F9FA'}
                  >
                    Đăng nhập
                  </button>
                </Link>
                
                <Link to="/signup">
                  <button style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '10px 25px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d2694d'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}
                  >
                    Đăng ký
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '20px', minHeight: '80vh' }}>
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #284b63 100%)',
            color: 'white',
            padding: '60px 40px',
            borderRadius: '15px',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold' }}>
              Chào mừng đến với AuctionHub
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: '0.9' }}>
              Nền tảng đấu giá trực tuyến hàng đầu - Nơi bạn tìm thấy những sản phẩm độc đáo với giá tốt nhất
            </p>
            {!user && (
              <Link to="/signup">
                <button style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '15px 40px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d2694d'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}
                >
                  Bắt đầu đấu giá ngay
                </button>
              </Link>
            )}
          </div>

          {/* Product Sections */}
          <ProductSection
            title="🔥 Top 5 sản phẩm gần kết thúc"
            products={products.slice(0, 5)}
          />

          <ProductSection
            title="💰 Top 5 sản phẩm có nhiều lượt ra giá nhất"
            products={products.slice(0, 5)}
          />

          <ProductSection
            title="🏆 Top 5 sản phẩm có giá cao nhất"
            products={products.slice(0, 5)}
          />
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '40px 20px',
          marginTop: '60px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap',
            gap: '40px'
          }}>
            <div>
              <h3 style={{ color: 'var(--color-accent)', marginBottom: '20px' }}>Về AuctionHub</h3>
              <p style={{ lineHeight: '1.6', maxWidth: '300px' }}>
                Nền tảng đấu giá trực tuyến uy tín, kết nối người mua và người bán trên toàn quốc.
              </p>
            </div>
            
            <div>
              <h3 style={{ color: 'var(--color-accent)', marginBottom: '20px' }}>Liên kết nhanh</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>Giới thiệu</Link>
                <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Liên hệ</Link>
                <Link to="/help" style={{ color: 'white', textDecoration: 'none' }}>Trợ giúp</Link>
              </div>
            </div>
            
            <div>
              <h3 style={{ color: 'var(--color-accent)', marginBottom: '20px' }}>Liên hệ</h3>
              <p>📧 support@auctionhub.com</p>
              <p>📞 1800-1234</p>
              <p>🏢 123 Đường ABC, Quận 1, TP.HCM</p>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #34495e',
            color: '#bdc3c7'
          }}>
            <p>2025 AuctionHub. Đồ án cuối kì.</p>
          </div>
        </div>
      </div>
    </>
  )
}