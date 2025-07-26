import ApiService from '../utils/api';

// Mock only AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('ApiService Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle login error correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          message: '아이디 또는 비밀번호가 잘못되었습니다.',
          error: 'Unauthorized',
          statusCode: 401
        }),
      })
    ) as jest.Mock;

    try {
      await ApiService.login('wrong', 'wrong');
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  });

  it('should save token on successful login', async () => {
    const mockToken = 'test-token-123';
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          accessToken: mockToken,
          user: {
            idx: 1,
            id: 'test',
            nickname: 'Test User'
          }
        }),
      })
    ) as jest.Mock;

    const result = await ApiService.login('test', 'test123');
    
    expect(result.accessToken).toBe(mockToken);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('accessToken', mockToken);
  });
});