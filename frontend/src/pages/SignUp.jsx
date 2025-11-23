import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import './SignUp.css'

export default function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Xử lý OAuth callback khi quay lại từ provider (cho signup)
  useEffect(() => {
    if (window.location.pathname === '/oauth/callback') {

      const isOAuthCallback = authService.handleOAuthCallback();
      if (isOAuthCallback) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      setLoading(false)
      return
    }

    const result = await register(formData)

    if (result.success) {
      navigate('/login', {
        state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
      })
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleGoogleSignUp = () => {
    authService.loginWithGoogle() // Dùng chung endpoint với login
  }

  const handleFacebookSignUp = () => {
    authService.loginWithFacebook() // Dùng chung endpoint với login
  }

  const handleGitHubSignUp = () => {
    authService.loginWithGitHub() // Dùng chung endpoint với login
  }

  return (
    <div className="signup-page">
      <div className="container">
        <h1>ĐĂNG KÝ TÀI KHOẢN</h1>

        <form onSubmit={handleSignUp}>
          <div className="input-group">

            <label>Họ và tên*</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Email*</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Địa chỉ*</label>
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu*</label>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label>Xác nhận mật khẩu*</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div style={{ border: '2px dotted #284b63', width: '200px', height: '70px', margin: '20px auto' }}>
            <div style={{ fontSize: '13px', textAlign: 'center', paddingTop: '20px', color: '#153243' }}>
              [reCAPTCHA]<br />I'm not a robot
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'ĐANG ĐĂNG KÝ...' : 'Đăng ký'}
          </button>
        </form>

        <div className="divider">
          <span>hoặc đăng ký với</span>
        </div>

        <button className="social-btn" onClick={handleGoogleSignUp}>
          Đăng ký với Google
        </button>
        <button className="social-btn" onClick={handleFacebookSignUp}>
          Đăng ký với Facebook
        </button>
        <button className="social-btn" onClick={handleGitHubSignUp}>
          Đăng ký với GitHub
        </button>

        <div className="bottom-text">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  )
}