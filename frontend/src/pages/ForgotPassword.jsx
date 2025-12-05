// pages/ForgotPassword.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await authService.forgotPassword(email);
    
    if (result.success) {
      setMessage(result.message);
      setEmailSent(true);
      console.log('✅ Kiểm tra OTP trong terminal backend');
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (message) setMessage('');
  };

  return (
    <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] text-[#153243] font-['Inter',sans-serif]">
      <div className="w-[420px]">
        <h1 className="text-center mb-[30px] text-[20px] font-semibold">QUÊN MẬT KHẨU</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              disabled={loading || emailSent}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${message && !message.includes('gửi') 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          {message && (
            <div className={`text-[13px] mt-1 mb-4 p-2 rounded text-center
              ${message.includes('gửi') 
                ? 'bg-green-100 text-green-700 border border-green-400' 
                : 'text-[#c62828]'
              }`}
            >
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || emailSent}
            className="w-full p-3 mt-2.5 bg-[#284b63] border-2 border-[#284b63] text-white text-[15px] font-semibold cursor-pointer hover:bg-[#1e3a4f] hover:border-[#1e3a4f] transition duration-150 disabled:opacity-70"
          >
            {loading ? 'ĐANG GỬI...' : emailSent ? 'ĐÃ GỬI OTP' : 'GỬI OTP'}
          </button>
        </form>

        {emailSent && (
          <div className="mt-6 text-center">
            <p className="text-[#153243] mb-2">📧 OTP đã được gửi đến email của bạn</p>
            
            <div className="navigation-buttons">
              <button 
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full mt-2 p-[14px] text-[15px] border-2 border-[#BFB1C1] bg-white text-[#153243] cursor-pointer font-semibold hover:bg-[#f5f5f5] transition duration-150"
              >
                NHẬP OTP VÀ MẬT KHẨU MỚI
              </button>
            </div>
          </div>
        )}

        <div className="mt-[15px] text-center text-[14px]">
          <Link 
            to="/login" 
            className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}