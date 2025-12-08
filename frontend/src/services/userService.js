import api from './api';

export const userService = {
  // Lấy tất cả user (cho Admin)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users'); // Route: /api/users
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy user đã xóa
  getDeletedUsers: async () => {
    try {
      const response = await api.get('/users/deleted');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa user (Soft delete)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Khôi phục user
  restoreUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};