import ApiService from '../utils/api';

// Mock fetch and AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('API Service Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Endpoint URLs', () => {
    it('should use correct register endpoint', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: '회원가입이 완료되었습니다.', user: {} }),
        })
      ) as jest.Mock;

      await ApiService.register('test', 'test1234', '테스트');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/register',
        expect.any(Object)
      );
    });

    it('should use correct login endpoint', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ accessToken: 'token', user: {} }),
        })
      ) as jest.Mock;

      await ApiService.login('test', 'test1234');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/login',
        expect.any(Object)
      );
    });

    it('should use correct profile endpoint', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue('test-token');

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: '로그인된 사용자 정보입니다.', user: {} }),
        })
      ) as jest.Mock;

      await ApiService.getProfile();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/profile',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('Request/Response Handling', () => {
    it('should send correct register request body', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: '회원가입이 완료되었습니다.', user: {} }),
        })
      ) as jest.Mock;

      await ApiService.register('testuser', 'pass1234', '테스트유저');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: 'testuser',
            password: 'pass1234',
            nickname: '테스트유저',
          }),
        })
      );
    });

    it('should handle register error responses', async () => {
      const errorResponse = {
        message: '이미 사용중인 아이디입니다.',
        error: 'Conflict',
        statusCode: 409,
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve(errorResponse),
        })
      ) as jest.Mock;

      await expect(ApiService.register('existing', 'pass1234', '유저')).rejects.toEqual(errorResponse);
    });

    it('should save token after successful login', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const loginResponse = {
        accessToken: 'jwt-token-123',
        user: { id: 'test', nickname: '테스트' },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(loginResponse),
        })
      ) as jest.Mock;

      const result = await ApiService.login('test', 'test1234');

      expect(result).toEqual(loginResponse);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', 'jwt-token-123');
    });
  });
});