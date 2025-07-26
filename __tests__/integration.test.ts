import ApiService from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch and AsyncStorage
global.fetch = jest.fn();
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration and Login Flow', () => {
    it('should complete full registration and login flow', async () => {
      // Step 1: Register new user
      const registerResponse = {
        message: '회원가입이 완료되었습니다.',
        user: {
          idx: 1,
          id: 'testuser',
          nickname: '테스트유저',
          createdAt: '2025-07-26T10:49:05.331Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => registerResponse,
      });

      const regResult = await ApiService.register('testuser', 'test1234', '테스트유저');
      expect(regResult).toEqual(registerResponse);

      // Step 2: Login with registered user
      const loginResponse = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        user: {
          idx: 1,
          id: 'testuser',
          nickname: '테스트유저'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
      });

      const loginResult = await ApiService.login('testuser', 'test1234');
      expect(loginResult).toEqual(loginResponse);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', loginResponse.accessToken);

      // Step 3: Check authentication status
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(loginResponse.accessToken);
      
      const profileResponse = {
        message: '로그인된 사용자 정보입니다.',
        user: {
          idx: 1,
          id: 'testuser',
          nickname: '테스트유저',
          createdAt: '2025-07-26T09:57:16.894Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => profileResponse,
      });

      const isAuthenticated = await ApiService.checkAuth();
      expect(isAuthenticated).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('should handle duplicate registration attempt', async () => {
      // First registration succeeds
      const firstRegResponse = {
        message: '회원가입이 완료되었습니다.',
        user: {
          idx: 1,
          id: 'duplicate',
          nickname: '중복유저',
          createdAt: '2025-07-26T10:49:05.331Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => firstRegResponse,
      });

      await ApiService.register('duplicate', 'pass1234', '중복유저');

      // Second registration with same ID fails
      const duplicateError = {
        message: '이미 사용중인 아이디입니다.',
        error: 'Conflict',
        statusCode: 409
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => duplicateError,
      });

      await expect(ApiService.register('duplicate', 'pass1234', '중복유저2')).rejects.toEqual(duplicateError);
    });
  });

  describe('Authentication Persistence', () => {
    it('should maintain authentication after app restart', async () => {
      const token = 'persisted-token';
      
      // Simulate token exists in storage
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(token);
      
      const profileResponse = {
        message: '로그인된 사용자 정보입니다.',
        user: {
          idx: 1,
          id: 'persisteduser',
          nickname: '지속유저',
          createdAt: '2025-07-26T09:57:16.894Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => profileResponse,
      });

      const isAuth = await ApiService.checkAuth();
      expect(isAuth).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/profile',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`
          })
        })
      );
    });

    it('should return false when no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      
      const isAuth = await ApiService.checkAuth();
      expect(isAuth).toBe(false);
    });
  });
});