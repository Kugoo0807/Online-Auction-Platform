import api from './api';

export const authService = {
  // Đăng nhập - backend trả về { token: "Bearer <accessToken>" }
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Backend trả về { token: "Bearer <accessToken>" }
    if (response.data.token) {
      const token = response.data.token.replace('Bearer ', '');
      localStorage.setItem('authToken', token);
    }
    
    // Lấy thông tin user sau khi login
    const userResponse = await api.get('/auth/me');
    if (userResponse.data.user) {
      localStorage.setItem('userInfo', JSON.stringify(userResponse.data.user));
      return { 
        user: userResponse.data.user,
        accessToken: response.data.token 
      };
    }
    
    return response.data;
  },

  // Đăng ký - backend expect: full_name, email, password, address, phone_number
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      full_name: userData.name,
      email: userData.email,
      password: userData.password,
      address: userData.address,
      phone_number: userData.phone_number || '' // Thêm phone_number nếu có
    });
    return response.data;
  },

  // Lấy profile user
  getProfile: async () => {
    const response = await api.get('/auth/me');
    
    if (response.data.user) { 
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Refresh token - backend dùng cookies
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    
    if (response.data.token) {
      const token = response.data.token.replace('Bearer ', '');
      localStorage.setItem('authToken', token);
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    }
  },

  // Đăng nhập Google - backend expect code
  loginWithGoogle: async (code) => {
    const response = await api.post('/auth/google/login', { code });
    
    if (response.data.token) {
      const token = response.data.token.replace('Bearer ', '');
      localStorage.setItem('authToken', token);
      
      // Lấy thông tin user
      const userResponse = await api.get('/auth/me');
      if (userResponse.data.user) {
        localStorage.setItem('userInfo', JSON.stringify(userResponse.data.user));
      }
    }
    
    return response.data;
  },

  // Lấy user từ localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('userInfo');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }
};