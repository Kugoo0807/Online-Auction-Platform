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
      setError(result.error)
    }
    setLoading(false)
  }

  const handleGoogleLogin = () => {
    authService.loginWithGoogle()
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
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="forgot-password">
          <a href="#" onClick={(e) => { e.preventDefault(); console.log('Forgot password clicked'); }}>
            Quên mật khẩu?
          </a>
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