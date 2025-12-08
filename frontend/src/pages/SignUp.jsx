import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export default function SignUp() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Nhập thông tin, 2: Xác thực OTP
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []); 

  useEffect(() => {
    if (window.location.pathname === '/oauth/callback') {
      const isOAuthCallback = authService.handleOAuthCallback();
      if (isOAuthCallback) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  // Xử lý đếm ngược cho nút gửi lại OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (name === 'otp' && otpError) setOtpError('');
    if (error) setError('');
  }

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
    if (otpError) setOtpError('');
  }

  // Bước 1: Gửi OTP xác thực
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    
    // Kiểm tra validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!formData.email || !formData.full_name || !formData.address) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }

    setOtpLoading(true);
    setError('');
    
    try {
      const result = await authService.sendSignupOTP(formData.email);
      
      if (result.success) {
        setStep(2);
        setCountdown(60);
      } else {
        if (result.isEmailExists) {
          setError('Email đã tồn tại trong hệ thống! Vui lòng đăng nhập.');
        } else {
          setError(result.message || 'Có lỗi xảy ra khi gửi OTP');
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.');
    } finally {
      setOtpLoading(false);
    }
  }

  // Bước 2: Xác thực OTP và đăng ký
  const handleRegisterWithOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp || formData.otp.length !== 6) {
      setOtpError('Vui lòng nhập mã OTP 6 số');
      return;
    }

    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(formData.otp)) {
      setOtpError('Mã OTP phải là 6 chữ số');
      return;
    }

    setLoading(true);
    setOtpError('');
    
    try {
      const result = await authService.registerWithOTP({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        address: formData.address,
        otp: formData.otp
      });

      if (result.success) {
        navigate('/login', {
          state: { 
            message: 'Đăng ký thành công! Vui lòng đăng nhập.',
            email: formData.email 
          }
        });
      } else {
        if (result.isOTPError) {
          setOtpError(result.message);
        } else if (result.isOTPExpired) {
          setOtpError('OTP đã hết hạn! Vui lòng gửi lại mã.');
        } else {
          setOtpError(result.message || 'Đăng ký thất bại');
        }
      }
    } catch (err) {
      setOtpError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  // Gửi lại OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setOtpLoading(true);
    setOtpError('');
    
    try {
      const result = await authService.sendSignupOTP(formData.email);
      
      if (result.success) {
        setCountdown(60);
      } else {
        setOtpError(result.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
      }
    } catch (err) {
      setOtpError('Có lỗi xảy ra khi gửi lại OTP');
    } finally {
      setOtpLoading(false);
    }
  }

  // Quay lại bước 1
  const handleBackToStep1 = () => {
    setStep(1);
    setOtpError('');
    setError('');
  }

  // Các hàm OAuth
  const handleGoogleSignUp = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const state = "google";

    if (!googleClientId || googleClientId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline&state=${state}`;

    window.location.href = targetUrl;
  };

  const handleFacebookSignUp = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;
    const state = "facebook";

    if (!facebookAppId || facebookAppId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`;

    window.location.href = targetUrl;
  };

  const handleGitHubSignUp = () => {
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const state = "github";

    if (!githubClientId || githubClientId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;

    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-700">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        <h1 className="text-center mb-2 text-2xl font-bold text-slate-800 tracking-tight uppercase">
          {step === 1 ? 'Đăng Ký' : 'Xác Thực OTP'}
        </h1>
        
        <p className="text-center text-slate-500 text-sm mb-8">
          {step === 1 ? 'Tạo tài khoản mới' : 'Nhập mã OTP đã gửi đến email của bạn'}
        </p>

        {/* Bước 1: Nhập thông tin đăng ký */}
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
              <input
                type="text"
                name="full_name"
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={otpLoading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                  ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={otpLoading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                  ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
              <input
                type="text"
                name="address"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={otpLoading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                  ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                name="password"
                placeholder="•••••••• (ít nhất 6 ký tự)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={otpLoading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                  ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={otpLoading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200
                  ${error ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={otpLoading}
              className="w-full py-3.5 rounded-lg bg-blue-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {otpLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </span>
              ) : 'Tiếp tục'}
            </button>
          </form>
        ) : (
          /* Bước 2: Nhập và xác thực OTP */
          <form onSubmit={handleRegisterWithOTP} className="space-y-5">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-600 mb-2">
                Mã OTP 6 số đã được gửi đến:
              </p>
              <p className="text-base font-semibold text-slate-800">
                {formData.email}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Vui lòng kiểm tra hộp thư và nhập mã bên dưới.
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="123456"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                inputMode="numeric"
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all duration-200 text-center tracking-[0.5em] font-mono text-lg
                  ${otpError ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-200' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-slate-400'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              />
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || otpLoading}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Đang gửi...' : 
                   countdown > 0 ? `Gửi lại sau ${countdown}s` : 
                   'Gửi lại mã OTP'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="text-xs text-slate-600 hover:text-slate-800 hover:underline"
                >
                  ← Quay lại
                </button>
              </div>
            </div>

            {/* OTP Error Message */}
            {otpError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-green-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-green-500/30 hover:bg-green-700 hover:shadow-green-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : 'Hoàn tất đăng ký'}
            </button>
          </form>
        )}

        {/* Divider và OAuth Buttons - Chỉ hiển thị ở bước 1 */}
        {step === 1 && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            {/* Social Login Buttons Grid */}
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-3 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-200 hover:border-slate-300 transition-all duration-200 font-medium text-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleFacebookSignUp}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-200 font-medium text-sm group cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                <button 
                  onClick={handleGitHubSignUp}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-[#24292F] hover:text-white hover:border-[#24292F] transition-all duration-200 font-medium text-sm group cursor-pointer"
                >
                  <svg className="w-5 h-5 text-[#24292F] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link 
            to="/login" 
            className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  )
}