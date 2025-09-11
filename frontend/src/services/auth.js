import { apiService } from './api';

export const authService = {
  async login(teacherId, password) {
    try {
      const response = await apiService.auth.login(teacherId, password);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(teacherData) {
    try {
      const response = await apiService.auth.register(teacherData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfile(token = null) {
    try {
      // If token is provided, use it temporarily
      if (token) {
        const tempApi = { ...apiService };
        tempApi.defaults.headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await apiService.auth.getProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  getStoredToken() {
    return localStorage.getItem('token');
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};