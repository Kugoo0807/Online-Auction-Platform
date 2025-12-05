// pages/ResetPassword.js
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    const result = await authService.resetPassword(email, otp, newPassword);
    
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (message) setMessage('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (message) setMessage('');
  };

  if (!email) {
    return (
      <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] font-sans text-[#153243]">
        <div className="w-[420px]">
          <div className="text-[#c62828] text-[13px] mt-1 mb-2 text-center">Email không hợp lệ</div>
          <div className="mt-[15px] text-center text-[14px]">
            <Link 
              to="/forgot-password" 
              className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
            >
              ← Quay lại quên mật khẩu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] font-sans text-[#153243]">
      <div className="w-[420px]">
        
        <h1 className="text-center mb-[30px] text-[20px] font-semibold">ĐẶT LẠI MẬT KHẨU</h1>
        
        <p className="mb-5 text-[14px] text-center text-[#153243]">
          OTP đã được gửi đến: <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">OTP (6 số)</label>
            <input
              type="text"
              placeholder="Nhập OTP 6 số"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              disabled={loading}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${message && !message.includes('thành công') 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              required
              minLength={6}
              disabled={loading}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${message && !message.includes('thành công') 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
              minLength={6}
              disabled={loading}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${message && !message.includes('thành công') 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          {message && (
            <div 
              className={`text-[13px] mt-1 mb-4 p-2 rounded text-center
                ${message.includes('thành công') 
                  ? 'bg-green-100 text-green-700 border border-green-400' 
                  : 'text-[#c62828]' 
                }`}
            >
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 mt-2.5 bg-[#284b63] border-2 border-[#284b63] text-white text-[15px] font-semibold cursor-pointer hover:bg-[#1e3a4f] hover:border-[#1e3a4f] transition duration-150 disabled:opacity-70"
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
          </button>
        </form>

        <div className="mt-[15px] text-center text-[14px]">
          <Link 
            to="/forgot-password" 
            className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}