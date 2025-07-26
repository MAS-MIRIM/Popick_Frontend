import ApiService from '../utils/api';

// Mock fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          idx: 1,
          id: 'testuser',
          nickname: '테스트유저'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiService.login('testuser', 'password123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: 'testuser', password: 'password123' }),
        })
      );
    });

    it('should throw error with invalid credentials', async () => {
      const mockError = {
        message: '아이디 또는 비밀번호가 잘못되었습니다.',
        error: 'Unauthorized',
        statusCode: 401
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(ApiService.login('wrong', 'wrong')).rejects.toEqual(mockError);
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        message: '회원가입이 완료되었습니다.',
        user: {
          idx: 1,
          id: 'newuser',
          nickname: '새유저',
          createdAt: '2025-07-26T10:49:05.331Z'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await ApiService.register('newuser', 'pass1234', '새유저');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: 'newuser', password: 'pass1234', nickname: '새유저' }),
        })
      );
    });

    it('should throw error when ID already exists', async () => {
      const mockError = {
        message: '이미 사용중인 아이디입니다.',
        error: 'Conflict',
        statusCode: 409
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(ApiService.register('existing', 'pass1234', 'user')).rejects.toEqual(mockError);
    });

    it('should throw error when password is too short', async () => {
      const mockError = {
        message: ['password must be longer than or equal to 4 characters'],
        error: 'Bad Request',
        statusCode: 400
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(ApiService.register('user', '123', 'user')).rejects.toEqual(mockError);
    });
  });
});