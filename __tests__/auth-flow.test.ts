import ApiService from '../utils/api';
import AsyncStorage from '../utils/mockStorage';

describe('Authentication Flow Tests', () => {
  beforeEach(async () => {
    // 각 테스트 전에 스토리지 초기화
    await AsyncStorage.clear();
  });

  describe('MockStorage Tests', () => {
    test('should store and retrieve token correctly', async () => {
      const testToken = 'test-token-123';
      
      // 토큰 저장
      await AsyncStorage.setItem('accessToken', testToken);
      
      // 토큰 조회
      const retrievedToken = await AsyncStorage.getItem('accessToken');
      expect(retrievedToken).toBe(testToken);
    });

    test('should return null for non-existent token', async () => {
      const token = await AsyncStorage.getItem('accessToken');
      expect(token).toBeNull();
    });

    test('should remove token correctly', async () => {
      await AsyncStorage.setItem('accessToken', 'test-token');
      await AsyncStorage.removeItem('accessToken');
      
      const token = await AsyncStorage.getItem('accessToken');
      expect(token).toBeNull();
    });
  });

  describe('API Service Tests', () => {
    const testUser = {
      id: `testuser${Date.now()}`, // 고유한 ID 생성
      password: 'test1234!',
      nickname: '테스트유저'
    };

    test('should register new user successfully', async () => {
      const response = await ApiService.register(
        testUser.id,
        testUser.password,
        testUser.nickname
      );

      expect(response.message).toBe('회원가입이 완료되었습니다.');
      expect(response.user).toHaveProperty('idx');
      expect(response.user.id).toBe(testUser.id);
      expect(response.user.nickname).toBe(testUser.nickname);
    });

    test('should fail registration with duplicate ID', async () => {
      // 첫 번째 등록
      await ApiService.register(testUser.id, testUser.password, testUser.nickname);
      
      // 중복 등록 시도
      await expect(
        ApiService.register(testUser.id, testUser.password, testUser.nickname)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: '이미 사용중인 아이디입니다.'
      });
    });

    test('should fail registration with short password', async () => {
      await expect(
        ApiService.register('shortpw', '123', 'nickname')
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.arrayContaining([
          expect.stringContaining('password must be longer than or equal to 4 characters')
        ])
      });
    });

    test('should login successfully and save token', async () => {
      // 먼저 회원가입
      await ApiService.register(testUser.id, testUser.password, testUser.nickname);
      
      // 로그인
      const loginResponse = await ApiService.login(testUser.id, testUser.password);
      
      expect(loginResponse.accessToken).toBeTruthy();
      expect(loginResponse.user).toMatchObject({
        id: testUser.id,
        nickname: testUser.nickname
      });

      // 토큰이 저장되었는지 확인
      const savedToken = await AsyncStorage.getItem('accessToken');
      expect(savedToken).toBe(loginResponse.accessToken);
    });

    test('should fail login with wrong credentials', async () => {
      await expect(
        ApiService.login('nonexistent', 'wrongpassword')
      ).rejects.toMatchObject({
        statusCode: 401,
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    });

    test('should get profile with valid token', async () => {
      // 회원가입 및 로그인
      await ApiService.register(testUser.id, testUser.password, testUser.nickname);
      await ApiService.login(testUser.id, testUser.password);
      
      // 프로필 조회
      const profileResponse = await ApiService.getProfile();
      
      expect(profileResponse.message).toBe('로그인된 사용자 정보입니다.');
      expect(profileResponse.user).toMatchObject({
        id: testUser.id,
        nickname: testUser.nickname
      });
    });

    test('should fail profile request without token', async () => {
      await expect(ApiService.getProfile()).rejects.toThrow('No token found');
    });

    test('should handle checkAuth correctly', async () => {
      // 토큰 없을 때
      const notAuthenticated = await ApiService.checkAuth();
      expect(notAuthenticated).toBe(false);
      
      // 로그인 후
      await ApiService.register(testUser.id, testUser.password, testUser.nickname);
      await ApiService.login(testUser.id, testUser.password);
      
      const authenticated = await ApiService.checkAuth();
      expect(authenticated).toBe(true);
    });
  });

  describe('Complete Auth Flow Test', () => {
    test('should complete entire auth flow: register -> login -> profile', async () => {
      const uniqueUser = {
        id: `flowtest${Date.now()}`,
        password: 'flow1234!',
        nickname: '플로우테스트'
      };

      // 1. 회원가입
      const registerResponse = await ApiService.register(
        uniqueUser.id,
        uniqueUser.password,
        uniqueUser.nickname
      );
      expect(registerResponse.message).toBe('회원가입이 완료되었습니다.');

      // 2. 로그인
      const loginResponse = await ApiService.login(
        uniqueUser.id,
        uniqueUser.password
      );
      expect(loginResponse.accessToken).toBeTruthy();

      // 3. 프로필 조회
      const profileResponse = await ApiService.getProfile();
      expect(profileResponse.user.id).toBe(uniqueUser.id);

      // 4. 로그아웃 (토큰 제거)
      await ApiService.removeToken();
      const tokenAfterLogout = await AsyncStorage.getItem('accessToken');
      expect(tokenAfterLogout).toBeNull();

      // 5. 로그아웃 후 프로필 조회 실패
      await expect(ApiService.getProfile()).rejects.toThrow('No token found');
    });
  });
});