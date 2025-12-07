import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../common/SearchBar';
import CategoryMenu from '../home/CategoryMenu';
import { upgradeRequestService } from '../../services/upgradeRequestService';

import ToastNotification from '../common/ToastNotification';
import ConfirmDialog from '../common/ConfirmDialog';

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // --- Xử lí upgrade ---
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleUpgradeRequest = async () => {
    setShowConfirmDialog(true);
  };

  const confirmUpgradeRequest = async () => {
    setShowConfirmDialog(false);
    setIsUpgrading(true);
  
    try {
      await upgradeRequestService.createRequest();
      const message = 'Gửi yêu cầu nâng cấp thành công!';
      
      ToastNotification(message, 'success');
    } catch (error) {
      const message = error?.response?.data?.message || 'Có lỗi xảy ra, thử lại sau!';
      
      ToastNotification(message, 'error');
    } finally {
      setIsUpgrading(false);
    }
  };

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
  const isBidder = user?.role === 'bidder';

  return (
    <header className="sticky top-0 bg-gray-900 py-3 md:py-4 px-4 md:px-6 flex flex-wrap md:flex-nowrap items-center shadow-lg z-50">
      
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
                <button className="
                    relative px-6 py-2 rounded-lg font-bold text-cyan-400 border border-cyan-400 
                    bg-gray-900 shadow-[0_0_10px_rgba(34,211,238,0.3)] 
                    hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:bg-cyan-400 hover:text-gray-900
                    transition-all duration-300 ease-in-out transform hover:scale-105
                    flex items-center gap-2 uppercase tracking-wider cursor-pointer
                ">
                  <span className="hidden sm:inline ml-1">Tạo đấu giá</span>
                  <span className="sm:hidden text-lg">+</span>
                </button>
              </Link>
            ) : isBidder ? (
              // Giao diện cho Bidder (Nút Nâng cấp)
              <button 
                onClick={handleUpgradeRequest}
                disabled={isUpgrading}
                className={`
                  relative px-6 py-2 rounded-lg font-bold text-amber-500 border border-amber-500 
                  bg-gray-900 shadow-[0_0_10px_rgba(245,158,11,0.3)] 
                  transition-all duration-300 ease-in-out transform
                  flex items-center gap-2 uppercase tracking-wider
                  ${isUpgrading 
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:bg-amber-500 hover:text-gray-900 hover:scale-105 cursor-pointer'
                  }
                `}
              >
                {isUpgrading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span className="hidden sm:inline">Đang gửi...</span>
                      <span className="sm:hidden">...</span>
                    </>
                ) : (
                    <>
                        <span className="hidden sm:inline ml-1">Nâng cấp lên Seller</span>
                        <span className="sm:hidden">Nâng cấp</span>
                    </>
                )}
              </button>
            ) : (
              // Giao diện admin
              <div className="
                  px-5 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 
                  text-emerald-400 font-mono font-bold tracking-widest text-sm
                  shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md
                  flex items-center gap-3 select-none cursor-default
              ">
                  <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  ADMINISTRATOR
              </div>
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
                  {isSeller || isBidder ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/profile/ratings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Đánh giá của tôi</Link>
                      <Link to="/manage-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Quản lý sản phẩm</Link>
                      <Link to="/auctions/bidding" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Đang tham gia đấu giá</Link>
                      <Link to="/auctions/won" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Sản phẩm đã thắng</Link>
                      <Link to="/watch-list" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Danh sách yêu thích</Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">Đăng xuất</button>
                    </>
                  )}
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

      {showConfirmDialog && (
        <ConfirmDialog
          message="Bạn có chắc chắn muốn gửi yêu cầu nâng cấp lên Seller?" 
          onYes={confirmUpgradeRequest}
          onNo={() => setShowConfirmDialog(false)}
        />
      )}
    </header>
  );
}