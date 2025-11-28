// pages/ForgotPassword.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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
    <div className="login-page">
      <div className="container">
        <h1>QUÊN MẬT KHẨU</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              disabled={loading || emailSent}
              className={message && !message.includes('gửi') ? 'error' : ''}
            />
          </div>

          {message && (
            <div className={`message ${message.includes('gửi') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading || emailSent}>
            {loading ? 'ĐANG GỬI...' : emailSent ? 'ĐÃ GỬI OTP' : 'GỬI OTP'}
          </button>
        </form>

        {emailSent && (
          <div className="otp-guide">
            <p>📧 OTP đã được gửi đến email của bạn</p>
            <p className="otp-notice">
              💡 <strong>Lưu ý Development:</strong> Kiểm tra terminal backend để lấy OTP 6 số
            </p>
            
            <div className="navigation-buttons">
              <button 
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="social-btn continue-btn"
              >
                NHẬP OTP VÀ MẬT KHẨU MỚI
              </button>
            </div>
          </div>
        )}

        <div className="bottom-text">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}