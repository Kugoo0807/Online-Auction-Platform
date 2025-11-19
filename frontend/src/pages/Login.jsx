import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    
    // TODO: Thay thế bằng API call thực tế để xác thực người dùng
    const fakeUser = {
      email,
      token: "mock-token-123"
    };

    // Lưu thông tin người dùng vào context và localStorage
    login(fakeUser);
    
    // Lấy đường dẫn trang trước đó (nếu có) hoặc về trang chủ
    // Điều này giúp người dùng quay lại trang họ đang xem trước khi bị chuyển đến trang đăng nhập
    const from = location.state?.from || "/"
    navigate(from, { replace: true }) // Chuyển hướng sau khi đăng nhập thành công
  }

  return (
    <div className="login-page">
      <div className="container">
        <h1>ĐĂNG NHẬP</h1>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">ĐĂNG NHẬP</button>
        </form>

        <div className="forgot-password">
          <a href="#" onClick={(e) => { e.preventDefault(); console.log('Forgot password clicked'); }}>
            Quên mật khẩu?
          </a>
        </div>

        <div className="divider">
          <span>hoặc đăng nhập với</span>
        </div>

        <button className="social-btn">Đăng nhập với Google</button>
        <button className="social-btn">Đăng nhập với Facebook</button>
        <button className="social-btn">Đăng nhập với GitHub</button>

        <div className="bottom-text">
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  )
}
