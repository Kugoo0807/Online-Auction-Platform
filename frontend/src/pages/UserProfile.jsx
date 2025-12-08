import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

import ToastNotification from '../components/common/ToastNotification.jsx'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserProfile = () => {
  // --- 1. STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State hiển thị đánh giá %
  const [ratingStats, setRatingStats] = useState({
    percent: 100, // Mặc định 100%
    count: 0
  });

  // Modal đổi mật khẩu
  const [showPassModal, setShowPassModal] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Form chỉnh sửa thông tin
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: ''
  });

  // --- 2. LOGIC LOAD DỮ LIỆU & TÍNH TOÁN % ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("=== ĐANG GỌI API PROFILE ===");
        const rawData = await authService.getProfile();
        
        // Xử lý dữ liệu trả về từ backend
        let finalUser = rawData.data || rawData.user || rawData.result || rawData;

        if (finalUser) {
          setUser(finalUser);
          
          setFormData({
            full_name: finalUser.full_name || '',
            phone_number: finalUser.phone_number || '',
            address: finalUser.address || ''
          });

          // === TÍNH TOÁN RATING ===
          const count = finalUser.rating_count || 0; 
          const score = finalUser.rating_score || 0;

          if (count > 0) {
            const pos = (count + score) / 2;
            let ratio = (pos / count) * 100;

            if (ratio > 100) ratio = 100;
            if (ratio < 0) ratio = 0;

            setRatingStats({
              percent: ratio.toFixed(1),
              count: count
            });
          } else {
            setRatingStats({ percent: 100, count: 0 });
          }
        }
      } catch (error) {
        console.error("Lỗi tải profile:", error);
        ToastNotification("Không thể tải thông tin người dùng", "error");
      }
    };
    fetchProfile();
  }, []);

  // --- 3. CÁC HÀM XỬ LÝ ---
  
  // Xử lý đóng modal & reset form
  const handleCloseModal = () => {
    setShowPassModal(false);
    setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Xử lý nhập liệu form
  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý LƯU THÔNG TIN
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(formData);
      
      setUser(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      
      ToastNotification("Cập nhật thông tin thành công!", "success");

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Không thể cập nhật thông tin";
      ToastNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý ĐỔI MẬT KHẨU
  const handleChangePass = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      ToastNotification("Mật khẩu xác nhận không khớp!", "warning");
      return;
    }
    
    try {
      await authService.changePassword(passData.oldPassword, passData.newPassword);
      
      ToastNotification("Đổi mật khẩu thành công!", "success");
      
      // Đóng modal và reset form
      handleCloseModal();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Mật khẩu cũ không đúng";
      ToastNotification(msg, "error");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      address: user.address || ''
    });
  };

  // --- 4. GIAO DIỆN ---
  
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <ToastContainer />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* === HEADER SECTION === */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${formData.full_name}&background=random&color=fff`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
              />
            </div>
            
            {/* Info Header */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{formData.full_name || "Người dùng"}</h1>
              <p className="text-gray-500 mb-3">{user.email}</p>
              
              <div className="flex gap-2 justify-center md:justify-start">
                <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-full uppercase">{user.role || 'MEMBER'}</span>
              </div>
            </div>
          </div>

          {/* Nút Action */}
          <div className="flex gap-3">
             {!isEditing && (
               <>
                <button 
                  onClick={() => setShowPassModal(true)}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Đổi mật khẩu
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Chỉnh sửa hồ sơ
                </button>
               </>
             )}
          </div>
        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h2>
                {isEditing && <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">Đang chỉnh sửa</span>}
            </div>
            
            <form onSubmit={handleSaveInfo} className="space-y-6">
              {/* Email (Read only) */}
              <div className="flex items-start gap-4">
                <div className="mt-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900 py-1">{user.email}</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Họ tên</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleChangeInfo} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 py-1">{formData.full_name || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="phone_number" 
                      value={formData.phone_number} 
                      onChange={handleChangeInfo} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 py-1">{formData.phone_number || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="mt-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChangeInfo} 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 py-1">{formData.address || "Chưa cập nhật"}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button type="button" onClick={handleCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    Hủy
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: RATING THEO PHẦN TRĂM (%) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Đánh giá & Uy tín</h2>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{ratingStats.percent}%</span>
                <span className="text-gray-500 text-sm ml-2">tích cực</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div 
                    className="bg-black h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${ratingStats.percent}%` }}
                ></div>
              </div>

              <div className="flex items-center gap-1 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                 <span className="font-medium text-gray-700">Đánh giá uy tín</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">Dựa trên {ratingStats.count} lượt đánh giá</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <div className="flex items-center gap-2 mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                 <span className="text-sm text-gray-500">Ngày tham gia</span>
               </div>
               <p className="font-medium text-gray-900 pl-6">
                 {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
               </p>
            </div>
          </div>
        </div>

        {/* === BOTTOM: FOOTER INFO === */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <h3 className="text-lg font-bold text-gray-900">Thông tin tài khoản</h3>
          </div>
          
          <div className="flex items-start gap-4 pl-1">
             <div className="mt-1 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Trạng thái hoạt động</p>
               <p className="font-medium text-gray-900">{user.is_deleted ? 'Đã khóa' : 'Đang hoạt động'}</p>
             </div>
          </div>
          
          {user.seller_expiry_date && (
            <div className="flex items-start gap-4 pl-1 mt-4">
               <div className="mt-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               </div>
               <div>
                 <p className="text-sm text-gray-500 mb-1">Hạn quyền Seller</p>
                 <p className="font-medium text-red-600">{new Date(user.seller_expiry_date).toLocaleDateString('vi-VN')}</p>
               </div>
            </div>
          )}
        </div>

      </div>

      {/* === MODAL ĐỔI MẬT KHẨU === */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleCloseModal}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h3>
               <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>

            <form onSubmit={handleChangePass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                <input type="password" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  value={passData.oldPassword} onChange={e => setPassData({...passData, oldPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input type="password" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  value={passData.confirmPassword} onChange={e => setPassData({...passData, confirmPassword: e.target.value})} />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium cursor-pointer">Đóng</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium cursor-pointer">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;