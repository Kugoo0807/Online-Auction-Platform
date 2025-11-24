import api from './api';

export const authService = {
  // Đăng nhập - backend trả về { token: "Bearer <accessToken>" }
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Backend trả về { token: "Bearer <accessToken>" }
    return {
      accessToken: response.data.token  
    };
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
    return response.data;
  },

  // Refresh token - backend dùng cookies
  refreshToken: async () => {
    // HttpOnly tự gửi
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } 
  },

  // Đăng nhập Google - backend expect code
  loginWithGoogle: async (code) => {
    const response = await api.post('/auth/google/login', { code });
    return { accessToken: response.data.token };
  },

  // Xử lý callback OAuth
  handleOAuthCallback: () => {
    return true;
  }
};