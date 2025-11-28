// pages/ResetPassword.js
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      return setMessage('Email không hợp lệ');
    }

    if (newPassword !== confirmPassword) {
      return setMessage('Mật khẩu không khớp');
    }

    if (newPassword.length < 6) {
      return setMessage('Mật khẩu phải có ít nhất 6 ký tự');
    }

    setLoading(true);

    const result = await authService.resetPassword(email, otp, newPassword);
    
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setMessage(result.message);
    }
    
    setLoading(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (message) setMessage('');
  };

  // Chỉ cho phép số trong OTP
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (message) setMessage('');
  };

  if (!email) {
    return (
      <div className="login-page">
        <div className="container">
          <div className="error-text">Email không hợp lệ</div>
          <div className="bottom-text">
            <Link to="/forgot-password">← Quay lại quên mật khẩu</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="container">
        <h1>ĐẶT LẠI MẬT KHẨU</h1>
        <p className="email-notice">OTP đã được gửi đến: <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>OTP (6 số)</label>
            <input
              type="text"
              placeholder="Nhập OTP 6 số"
              value={otp}
              onChange={handleOtpChange}
              required
              maxLength={6}
              className={message ? 'error' : ''}
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              required
              minLength={6}
              className={message ? 'error' : ''}
            />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
              minLength={6}
              className={message ? 'error' : ''}
            />
          </div>

          {message && (
            <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
          </button>
        </form>

        <div className="bottom-text">
          <Link to="/forgot-password">← Quay lại</Link>
        </div>
      </div>
    </div>
  );
}