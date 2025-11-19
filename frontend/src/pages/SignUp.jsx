import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './SignUp.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    console.log('Sign up attempt:', formData)
    // TODO: Thêm API call để đăng ký tài khoản mới
    // Tạm thời chuyển hướng đến trang đăng nhập sau khi đăng ký
    navigate('/login')
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
            />
            {/* TODO: Hiển thị thông báo lỗi nếu email đã được sử dụng */}
            {/* <div className="error-text">Email đã được sử dụng</div> */}
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
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu*</label>
            <input 
              type="password" 
              name="password"
              placeholder="Mật khẩu" 
              value={formData.password}
              onChange={handleChange}
              required
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
            />
            {/* TODO: Validate và hiển thị thông báo nếu mật khẩu không trùng khớp */}
            {/* <div className="error-text">Không trùng khớp</div> */}
          </div>

          <div style={{ border: '2px dotted #284b63', width: '200px', height: '70px', margin: '20px auto' }}>
            <div style={{ fontSize: '13px', textAlign: 'center', paddingTop: '20px', color: '#153243' }}>
              [reCAPTCHA]<br />I'm not a robot
            </div>
          </div>

          <button type="submit">Đăng ký</button>
        </form>

        <div className="divider">
          <span>hoặc đăng ký với</span>
        </div>

        <button className="social-btn" onClick={() => console.log('Google signup')}>
          Đăng ký với Google
        </button>
        <button className="social-btn" onClick={() => console.log('Facebook signup')}>
          Đăng ký với Facebook
        </button>
        <button className="social-btn" onClick={() => console.log('GitHub signup')}>
          Đăng ký với GitHub
        </button>

        <div className="bottom-text">
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  )
}


