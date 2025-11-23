import api from './api';

export const authService = {
  // đăng nhập với backend hiện tại
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // đăng ký với backend hiện tại
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // đăng nhập với Google
  loginWithGoogle: async () => {
    // chuyển hướng lại đến backend Google OAuth
    window.location.href = 'http://localhost:5000/api/auth/google';
  },

  // refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh-token', { refreshToken });
    
    if (response.data.accessToken) {
      localStorage.setItem('authToken', response.data.accessToken);
    }
    
    return response.data;
  },

  // lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('userInfo');
    return userStr ? JSON.parse(userStr) : null;
  },

  // đăng xuất
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  },

  // lấy profile user
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // cập nhật profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    if (response.data.user) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  handleOAuthCallback: () => {
    // kiểm tra xem có phải đang ở trang callback không
    const isCallbackPage = window.location.pathname === '/oauth/callback';
    if (isCallbackPage) {
      return true;
    }
    
    // kiểm tra token trong URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');
    
    if (token && user) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userInfo', user);
      return true;
    }
    
    return false;
  }
};