import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';
import CategoryMenu from '../home/CategoryMenu';

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    alert(`Tìm kiếm: ${query}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-primary)', padding: '15px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '24px', fontWeight: 'bold', marginRight: '20px' }}>
        AuctionHub
      </Link>

      {/* Danh mục Button & Dropdown */}
      <div onMouseEnter={() => setShowCategories(true)} onMouseLeave={() => setShowCategories(false)} style={{ position: 'relative' }}>
        <button style={{ backgroundColor: '#151718ff', fontSize: '18px', border: 'none', padding: '12px 20px', borderRadius: '25px', minWidth: '150px' }}>
          📂 Danh mục
        </button>
        <CategoryMenu 
            show={showCategories} 
            onHover={setShowCategories} 
            onClickCategory={(name) => console.log(name)} 
        />
      </div>

      {/* Search Bar */}
      <div style={{ margin: '0 20px', flex: 1 }}>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* User Actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
        {user ? (
          <>
             <Link to="/create-auction"><button>➕ Tạo đấu giá</button></Link> {/* Thêm style vào nhé */}
             <span>👤 {user.name || user.email}</span>
             <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/login"><button>Đăng nhập</button></Link>
            <Link to="/signup"><button>Đăng ký</button></Link>
          </>
        )}
      </div>
    </div>
  );
}