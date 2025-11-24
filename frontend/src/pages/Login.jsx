import { Link, useNavigate, useLocation } from 'react-router-dom'
<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
=======
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
<<<<<<< HEAD
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Xử lý OAuth callback khi quay lại từ provider
  useEffect(() => {
    if (window.location.pathname === '/oauth/callback') {

      const isOAuthCallback = authService.handleOAuthCallback();
      if (isOAuthCallback) {
        const from = location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      }
    }
  }, [navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login({ email, password })

    if (result.success) {
      const from = location.state?.from || "/dashboard"
      navigate(from, { replace: true })
    } else {
      // Hiển thị lỗi đỏ (class 'error' sẽ được áp dụng)
      setError(result.error)
    }
    setLoading(false)
  }

  // hàm helper để cập nhật input và tự động xóa lỗi khi người dùng sửa
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError(''); // xóa thông báo lỗi ngay khi gõ
  };

  const handleGoogleLogin = () => {
    // get config
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

    if (!googleClientId || googleClientId.includes('placeholder')) {
        alert("Note: You are using a placeholder Client ID. Google will show an error, but this proves the redirect works!");
    }

    // construct Google Auth URL
    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline`;

    // redirect
    window.location.href = targetUrl;
  }

  const handleFacebookLogin = () => {
    authService.loginWithFacebook()
  }

  const handleGitHubLogin = () => {
    authService.loginWithGitHub()
=======

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
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131
  }

  return (
    <div className="login-page">
      <div className="container">
        <h1>ĐĂNG NHẬP</h1>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
<<<<<<< HEAD
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleInputChange(setEmail)} // dùng handleInputChange để xóa lỗi khi gõ
              required
              disabled={loading}
              className={error ? 'error' : ''} // 'error' để hiện viền đỏ
=======
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
<<<<<<< HEAD
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={handleInputChange(setPassword)} // dùng handleInputChange để xóa lỗi khi gõ
              required
              disabled={loading}
              className={error ? 'error' : ''} // 'error' để hiện viền đỏ
            />
          </div>

          {/* Hiển thị message lỗi màu đỏ */}
          {error && <div className="error-text">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
=======
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">ĐĂNG NHẬP</button>
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131
        </form>

        <div className="forgot-password">
          <a href="#" onClick={(e) => { e.preventDefault(); console.log('Forgot password clicked'); }}>
            Quên mật khẩu?
          </a>
        </div>

        <div className="divider">
          <span>hoặc đăng nhập với</span>
        </div>

<<<<<<< HEAD
        <button className="social-btn" onClick={handleGoogleLogin}>
          Đăng nhập với Google
        </button>
        <button className="social-btn" onClick={handleFacebookLogin}>
          Đăng nhập với Facebook
        </button>
        <button className="social-btn" onClick={handleGitHubLogin}>
          Đăng nhập với GitHub
        </button>
=======
        <button className="social-btn">Đăng nhập với Google</button>
        <button className="social-btn">Đăng nhập với Facebook</button>
        <button className="social-btn">Đăng nhập với GitHub</button>
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131

        <div className="bottom-text">
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> d8a75a7afe93f1808d1dcd0b2e71809e6dad6131
