import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { setAuthToken } from '../services/api'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {setUser} = useAuth()
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      flexDirection: 'column',
      background: '#c7dbe6',
      fontFamily: 'Inter, sans-serif',
      color: '#153243'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #b5bec6',
        borderTopColor: '#284b63',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <h3 style={{ marginTop: '20px', fontWeight: '600' }}>Processing Google Login...</h3>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}