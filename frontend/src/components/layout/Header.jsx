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
    if (query.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-gray-900 py-4 px-6 flex items-center shadow-lg relative z-50">
      
      {/* 1. Logo */}
      <Link 
        to="/" 
        className="text-white text-2xl font-bold mr-6 shrink-0 hover:text-blue-400 transition-colors duration-200"
      >
        AuctionHub
      </Link>

      {/* 2. Nút Danh mục & Dropdown */}
      <div 
        className="relative shrink-0"
        onMouseEnter={() => setShowCategories(true)} 
        onMouseLeave={() => setShowCategories(false)} 
      >
        <button className="bg-gray-800 text-white text-lg py-2.5 px-6 rounded-full min-w-[150px] hover:bg-gray-700 transition duration-200 flex items-center justify-center whitespace-nowrap border border-gray-700 cursor-pointer">
          <span className="mr-2">📂</span> Danh mục
        </button>
        
        <CategoryMenu 
            show={showCategories} 
            onHover={setShowCategories} 
            onClickCategory={(name) => console.log(name)} 
        />
      </div>

      {/* 3. Search Bar */}
      <div className="mx-6 flex-1 min-w-[200px]">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 4. User Actions */}
      <div className="ml-auto flex items-center gap-4 shrink-0">
        {user ? (
          <>
            <Link to="/create-auction">
              <button className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-white hover:shadow transition duration-200 flex items-center cursor-pointer">
                ➕ <span className="hidden sm:inline ml-1">Tạo đấu giá</span>
              </button>
            </Link>
            
            <span className="text-gray-200 font-medium truncate max-w-[150px]">
              👤 {user.name || user.email}
            </span>
            
            <button 
              onClick={handleLogout} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition duration-200 cursor-pointer"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            
            <Link to="/login">
              <button className="bg-gray-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition duration-200 whitespace-nowrap border border-gray-600 cursor-pointer">
                Đăng nhập
              </button>
            </Link>


            <Link to="/signup">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 whitespace-nowrap shadow-md shadow-blue-900/20 cursor-pointer">
                Đăng ký
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}