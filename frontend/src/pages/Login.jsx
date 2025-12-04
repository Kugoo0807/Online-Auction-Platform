import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login({ email, password });

    if (result.success) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const handleGoogleLogin = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const state = "google"; // Đánh dấu đây là login google

    if (!googleClientId || googleClientId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
      redirectUri
    )}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline&state=${state}`;

    window.location.href = targetUrl;
  };

  const handleFacebookLogin = () => {
    const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    const redirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;
    const state = "facebook"; // Đánh dấu đây là login facebook

    if (!facebookAppId || facebookAppId.includes('placeholder')) {
      alert("Note: You are using a placeholder Client ID.");
    }

    const targetUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,public_profile`;

    window.location.href = targetUrl;
  };

  const handleGitHubLogin = () => {
    authService.loginWithGitHub();
  };

  return (
    <div className="bg-[#c7dbe6] min-h-screen flex justify-center py-[60px] font-sans text-[#153243]">
      <div className="w-[420px]">
        
        <h1 className="text-center mb-[30px] text-[20px] font-semibold">ĐĂNG NHẬP</h1>

        <form onSubmit={handleLogin}>
          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleInputChange(setEmail)}
              required
              disabled={loading}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${error 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          <div className="mb-[18px]">
            <label className="block text-[15px] font-semibold">Mật khẩu</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
              disabled={loading}
              className={`w-full p-3 mt-1.5 border rounded-[3px] text-[15px] text-[#153243] focus:outline-none focus:border-[#284b63] transition-colors
                ${error 
                  ? 'bg-[#f5b3b3] border-[#e77]' 
                  : 'bg-[#b5bec6] border-[#b5bec6]'
                }`}
            />
          </div>

          {error && <div className="text-[#c62828] text-[13px] mt-1 mb-2">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 mt-2.5 bg-[#284b63] border-2 border-[#284b63] text-white text-[15px] font-semibold cursor-pointer hover:bg-[#1e3a4f] hover:border-[#1e3a4f] transition duration-150 disabled:opacity-70"
          >
            {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="text-center mt-2.5 mb-0">
          <Link 
            to="/forgot-password" 
            className="text-[13px] text-[#153243] hover:underline hover:text-[#284b63]"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <div className="relative text-center my-5 text-[#153243] text-[13px]">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#284b63]"></span>
          </div>
          <span className="relative bg-[#c7dbe6] px-2 z-10">
            hoặc đăng nhập với
          </span>
        </div>

        <button 
          className="w-full mt-2 p-3.5 text-[15px] font-semibold border-2 border-[#BFB1C1] bg-white text-[#153243] hover:bg-[#f5f5f5] transition duration-150 cursor-pointer"
          onClick={handleGoogleLogin}
        >
          Đăng nhập với Google
        </button>
        <button 
          className="w-full mt-2 p-3.5 text-[15px] font-semibold border-2 border-[#BFB1C1] bg-white text-[#153243] hover:bg-[#f5f5f5] transition duration-150 cursor-pointer"
          onClick={handleFacebookLogin}
        >
          Đăng nhập với Facebook
        </button>
        <button 
          className="w-full mt-2 p-3.5 text-[15px] font-semibold border-2 border-[#BFB1C1] bg-white text-[#153243] hover:bg-[#f5f5f5] transition duration-150 cursor-pointer"
          onClick={handleGitHubLogin}
        >
          Đăng nhập với GitHub
        </button>

        <div className="mt-[15px] text-center text-[14px]">
          Chưa có tài khoản?{' '}
          <Link 
            to="/signup" 
            className="font-semibold text-[#284b63] underline hover:text-[#1e3a4f]"
          >
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}