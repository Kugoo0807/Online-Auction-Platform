import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
              onChange={handleInputChange(setEmail)} // dùng handleInputChange để xóa lỗi khi gõ
              required
              disabled={loading}
              className={error ? 'error' : ''} // 'error' để hiện viền đỏ
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
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
        </form>

        <div className="forgot-password">
          <Link to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="divider">
          <span>hoặc đăng nhập với</span>
        </div>

        <button className="social-btn" onClick={handleGoogleLogin}>
          Đăng nhập với Google
        </button>
        <button className="social-btn" onClick={handleFacebookLogin}>
          Đăng nhập với Facebook
        </button>
        <button className="social-btn" onClick={handleGitHubLogin}>
          Đăng nhập với GitHub
        </button>

        <div className="bottom-text">
          Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  )
}