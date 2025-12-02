import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';
import CategoryMenu from '../home/CategoryMenu';

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSeller = user?.role === 'seller';

  return (
    <header className="bg-gray-900 py-3 md:py-4 px-4 md:px-6 flex flex-wrap md:flex-nowrap items-center shadow-lg relative z-50">
      
      {/* 1. Logo */}
      <Link 
        to="/" 
        className="text-white text-xl md:text-2xl font-bold mr-auto md:mr-6 shrink-0 hover:text-blue-400 transition-colors duration-200"
      >
        AuctionHub
      </Link>

      {/* 2. Nút Danh mục & Dropdown */}
      <div 
        className="relative shrink-0 hidden md:block"
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
      <div className="w-full md:w-auto order-last md:order-none mt-3 md:mt-0 mx-0 md:mx-6 flex-1 min-w-[200px]">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* 4. User Actions */}
      <div className="ml-0 md:ml-auto flex items-center gap-2 md:gap-4 shrink-0">
        {user ? (
          <>
            {isSeller ? (
              // Giao diện cho Seller
              <Link to="/products/create">
                <button className="bg-blue-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold hover:bg-blue-900 hover:shadow transition duration-200 flex items-center cursor-pointer border border-blue-500 text-sm md:text-base">
                  <span className="hidden sm:inline ml-1">Tạo đấu giá</span>
                  <span className="sm:hidden text-lg">+</span>
                </button>
              </Link>
            ) : (
              // Giao diện cho Bidder (Nút Nâng cấp)
              <Link to="/upgrade-request">
                <button className="bg-yellow-500 text-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold hover:bg-yellow-700 hover:shadow transition duration-200 flex items-center cursor-pointer border border-yellow-600 text-sm md:text-base">
                  <span className="hidden sm:inline ml-1">Nâng cấp lên Seller</span>
                  <span className="sm:hidden">Nâng cấp</span>
                </button>
              </Link>
            )}
            
            {/* USER DROPDOWN MENU */}
            <div className="relative" ref={userMenuRef}>
              {/* Nút Avatar + Tên */}
              <button
                onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-gray-200 hover:text-white hover:bg-gray-800 px-2 md:px-3 py-2 rounded-lg transition-all focus:outline-none select-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white border border-gray-600">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {/* Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header nhỏ trong menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-blue-500 rounded-full uppercase">
                      {user.role}
                    </span>
                  </div>

                  {/* Các Links */}
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>

                  <Link 
                    to="/manage-products" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Quản lý sản phẩm
                  </Link>
                  
                  <Link 
                    to="/my-bids" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Lịch sử đấu giá
                  </Link>
                  
                  <Link 
                    to="/watch-list" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Danh sách yêu thích
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button 
                    onMouseOver={(e) => e.currentTarget.style.cursor = "pointer"}
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            
            <Link to="/login">
              <button className="bg-gray-800 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition duration-200 whitespace-nowrap border border-gray-600 cursor-pointer text-sm md:text-base">
                Đăng nhập
              </button>
            </Link>


            <Link to="/signup">
              <button className="bg-blue-600 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 whitespace-nowrap shadow-md shadow-blue-900/20 cursor-pointer text-sm md:text-base">
                Đăng ký
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}