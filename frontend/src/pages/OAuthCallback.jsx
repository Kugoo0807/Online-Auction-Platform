import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { setAuthToken } from '../services/api'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const processedRef = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Lấy state để phân biệt

    if (code && !processedRef.current) {
      processedRef.current = true;

      const handleCallback = async () => {
        try {
          let data;
          
          // Kiểm tra xem là Facebook hay Google
          if (state === 'facebook') {
             console.log("Processing Facebook Login...");
             data = await authService.loginWithFacebook(code);
          } else if (state === 'google') {
             console.log("Processing Google Login...");
             data = await authService.loginWithGoogle(code);
          } else if (state === 'github') {
             console.log("Processing GitHub Login...");
             data = await authService.loginWithGitHub(code);
          } else {
             // Nếu state không rõ, cố gắng mặc định fallback gọi google
             console.log("Processing login from unknown provider (no state).");
             data = await authService.loginWithGoogle(code);
          }

          // Đoạn dưới giữ nguyên (Lưu token, lấy profile, redirect)
          const rawToken = data.accessToken.replace('Bearer ', '');
          setAuthToken(rawToken);
          const profileRes = await authService.getProfile();
          setUser(profileRes.user);
          navigate('/dashboard', { replace: true });

        } catch (error) {
          console.error("Login Failed:", error);
          navigate('/login', { state: { error: 'Login failed. Please try again.' } });
        }
      };

      handleCallback();
    } else if (!code) {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  // Lấy provider từ state để hiển thị message động; nếu không có state thì dùng neutral label
  const providerState = new URLSearchParams(window.location.search).get('state');
  const providerLabel =
    providerState === 'facebook' ? 'Facebook' :
    providerState === 'google' ? 'Google' :
    providerState === 'github' ? 'GitHub' :
    'OAuth provider';

  return (
    <div className="flex justify-center items-center h-screen flex-col bg-[#c7dbe6] font-sans text-[#153243]">
      <div className="w-[50px] h-[50px] border-[5px] border-[#b5bec6] border-t-[#284b63] rounded-full animate-spin"></div>
      <h3 className="mt-5 font-semibold">Processing {providerLabel} Login...</h3>
    </div>
  )
}