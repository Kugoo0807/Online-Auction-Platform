import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // lấy token mới từ refresh token
        const data = await authService.refreshToken();
        if (data.token) {
          const rawToken = data.token.replace('Bearer ', '');
          // lưu vào ram
          setAuthToken(rawToken);

          // có token rồi thì lấy profile
          const profileRes = await authService.getProfile();
          setUser(profileRes.user);
        }
      } catch (error) {
        // không có token hoặc lỗi gì thì coi như chưa đăng nhập
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Lấy token
      const data = await authService.login(credentials.email, credentials.password);

      // Lưu token vào ram
      const rawToken = data.accessToken.replace('Bearer ', '');
      setAuthToken(rawToken);

      // Lấy profile sau khi login
      const profileRes = await authService.getProfile();
      setUser(profileRes.user);
      return { success: true, data };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAuthToken(null); // xóa token ram
    setUser(null);
    navigate('./login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      setUser, //OAuth sẽ sử dụng
      login, 
      register, 
      logout,
      loading 
    }}>
      {loading ? (
        <div style={{
          height: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontSize: '1.2rem',
          color: '#555'
        }}>
          Running App...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);