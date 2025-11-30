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
    const code = searchParams.get('code')

    if (code && !processedRef.current) {
      processedRef.current = true; 

      const handleGoogleCallback = async () => {
        try {
          console.log("Received Google Code:", code);
          
          // send code to Backend
          const data = await authService.loginWithGoogle(code);
          
          // save Access Token to RAM (via api.js helper)
          const rawToken = data.accessToken.replace('Bearer ', '');
          setAuthToken(rawToken);

          // get User Profile immediately
          const profileRes = await authService.getProfile();
          setUser(profileRes.user);

          // redirect to Dashboard
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Google Login Failed:", error);
          navigate('/login', { state: { error: 'Google Login failed. Please try again.' } });
        }
      }

      handleGoogleCallback();
    } else if (!code) {
      // go back to login if no code found
      navigate('/login');
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen flex-col bg-[#c7dbe6] font-sans text-[#153243]">
      <div className="w-[50px] h-[50px] border-[5px] border-[#b5bec6] border-t-[#284b63] rounded-full animate-spin"></div>
      <h3 className="mt-5 font-semibold">Processing Google Login...</h3>
    </div>
  )
}