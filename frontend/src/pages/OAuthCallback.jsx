import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const user = searchParams.get('user')
      
      if (token && user) {
        localStorage.setItem('authToken', token)
        localStorage.setItem('userInfo', user)
        navigate('/dashboard', { replace: true })
      } else {
        // xử lý lỗi
        navigate('/login', { 
          replace: true, 
          state: { error: 'Đăng nhập thất bại' } 
        })
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Đang xử lý đăng nhập...</div>
    </div>
  )
}