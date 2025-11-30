import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

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
    authService.loginWithGoogle()
  }

  const handleFacebookSignUp = () => {
    authService.loginWithFacebook()
  }

  const handleGitHubSignUp = () => {
    authService.loginWithGitHub()
  }

  return (
    <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] font-sans text-[#153243]">
      <div className="w-[420px]">
        <h1 className="text-center mb-[30px] text-[20px] font-semibold">ĐĂNG KÝ TÀI KHOẢN</h1>

        <form onSubmit={handleSignUp}>
          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Họ và tên*</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 mt-[5px] border border-[#b5bec6] rounded-[3px] bg-[#b5bec6] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63]"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Email*</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 mt-[5px] border border-[#b5bec6] rounded-[3px] bg-[#b5bec6] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63]"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Địa chỉ*</label>
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 mt-[5px] border border-[#b5bec6] rounded-[3px] bg-[#b5bec6] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63]"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Mật khẩu*</label>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (ít nhất 6 ký tự)"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 mt-[5px] border border-[#b5bec6] rounded-[3px] bg-[#b5bec6] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63]"
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Xác nhận mật khẩu*</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-3 mt-[5px] border border-[#b5bec6] rounded-[3px] bg-[#b5bec6] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63]"
            />
          </div>

          {error && <div className="text-[#c62828] text-[13px] mt-1">{error}</div>}

          <div className="border-2 border-dotted border-[#284b63] w-[200px] h-[70px] mx-auto my-5">
            <div className="text-[13px] text-center pt-5 text-[#153243]">
              [reCAPTCHA]<br />I'm not a robot
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 mt-2.5 bg-[#284b63] border-2 border-[#284b63] text-white cursor-pointer text-[15px] font-semibold transition duration-150 hover:bg-[#1e3a4f] hover:border-[#1e3a4f]"
          >
            {loading ? 'ĐANG ĐĂNG KÝ...' : 'Đăng ký'}
          </button>
        </form>

        <div className="relative text-center my-5 text-[#153243] text-[13px]">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#284b63]"></span>
          </div>
          <span className="relative bg-[#c7dbe6] px-2 z-10">
            hoặc đăng ký với
          </span>
        </div>

        <button 
          className="w-full mt-2 p-3.5 text-[15px] border-2 border-[#BFB1C1] bg-white text-[#153243] cursor-pointer font-semibold transition duration-150 hover:bg-[#f5f5f5]"
          onClick={handleGoogleSignUp}
        >
          Đăng ký với Google
        </button>
        <button 
          className="w-full mt-2 p-3.5 text-[15px] border-2 border-[#BFB1C1] bg-white text-[#153243] cursor-pointer font-semibold transition duration-150 hover:bg-[#f5f5f5]"
          onClick={handleFacebookSignUp}
        >
          Đăng ký với Facebook
        </button>
        <button 
          className="w-full mt-2 p-3.5 text-[15px] border-2 border-[#BFB1C1] bg-white text-[#153243] cursor-pointer font-semibold transition duration-150 hover:bg-[#f5f5f5]"
          onClick={handleGitHubSignUp}
        >
          Đăng ký với GitHub
        </button>

        <div className="mt-[15px] text-center text-[14px]">
          Đã có tài khoản?{' '}
          <Link 
            to="/login" 
            className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  )
}