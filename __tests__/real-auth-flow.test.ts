import ApiService from '../utils/api';
import AsyncStorage from '../utils/mockStorage';

// Real API 테스트를 위한 fetch polyfill
const nodeFetch = require('node').native.require('node-fetch');
global.fetch = nodeFetch;

describe('Real API Authentication Flow Tests', () => {
  beforeEach(async () => {
    // 각 테스트 전에 스토리지 초기화
    await AsyncStorage.clear();
  });

  describe('MockStorage Persistence Issue', () => {
    test('MockStorage loses data on app restart', async () => {
      // 토큰 저장
      await AsyncStorage.setItem('accessToken', 'test-token-123');
      
      // 현재 세션에서는 토큰이 존재
      const tokenBeforeRestart = await AsyncStorage.getItem('accessToken');
      expect(tokenBeforeRestart).toBe('test-token-123');
      
      // 앱 재시작을 시뮬레이션 (새로운 MockStorage 인스턴스)
      const NewMockStorage = require('../utils/mockStorage').default;
      
      // 재시작 후 토큰이 사라짐
      const tokenAfterRestart = await NewMockStorage.getItem('accessToken');
      expect(tokenAfterRestart).toBeNull();
      
      console.log('⚠️  MockStorage는 메모리에만 데이터를 저장하므로 앱 재시작 시 모든 데이터가 사라집니다.');
    });
  });

  describe('Real API Integration Tests', () => {
    const testUser = {
      id: `test${Date.now()}`, // 고유한 ID 생성
      password: 'test1234!',
      nickname: '테스트유저'
    };

    test('should complete full authentication flow with real API', async () => {
      try {
        // 1. 회원가입
        console.log('1. 회원가입 테스트');
        const registerResponse = await ApiService.register(
          testUser.id,
          testUser.password,
          testUser.nickname
        );
        expect(registerResponse.message).toBe('회원가입이 완료되었습니다.');
        expect(registerResponse.user.id).toBe(testUser.id);
        console.log('✅ 회원가입 성공:', registerResponse);

        // 2. 로그인
        console.log('\n2. 로그인 테스트');
        const loginResponse = await ApiService.login(testUser.id, testUser.password);
        expect(loginResponse.accessToken).toBeTruthy();
        expect(loginResponse.user.id).toBe(testUser.id);
        console.log('✅ 로그인 성공, 토큰 발급됨');

        // 3. 토큰 저장 확인
        const savedToken = await AsyncStorage.getItem('accessToken');
        expect(savedToken).toBe(loginResponse.accessToken);
        console.log('✅ 토큰이 MockStorage에 저장됨');

        // 4. 프로필 조회
        console.log('\n3. 프로필 조회 테스트');
        const profileResponse = await ApiService.getProfile();
        expect(profileResponse.message).toBe('로그인된 사용자 정보입니다.');
        expect(profileResponse.user.id).toBe(testUser.id);
        console.log('✅ 프로필 조회 성공:', profileResponse);

        // 5. 앱 재시작 시뮬레이션
        console.log('\n4. 앱 재시작 시뮬레이션');
        console.log('⚠️  앱을 재시작하면 MockStorage의 모든 데이터가 사라집니다.');
        
        // 이것이 현재 문제의 원인입니다
        console.log('\n📌 문제 원인:');
        console.log('- MockStorage는 메모리에만 데이터를 저장');
        console.log('- 앱 재시작 시 모든 데이터 손실');
        console.log('- 따라서 로그인 상태가 유지되지 않음');
        
        console.log('\n💡 해결 방법:');
        console.log('1. iOS: pod install 후 실제 AsyncStorage 사용');
        console.log('2. 또는 MockStorage를 파일 시스템 기반으로 개선');

      } catch (error) {
        console.error('테스트 실패:', error);
        throw error;
      }
    });

    test('should handle duplicate registration', async () => {
      const duplicateUser = {
        id: `dup${Date.now()}`,
        password: 'dup1234!',
        nickname: '중복테스트'
      };

      // 첫 번째 등록
      await ApiService.register(
        duplicateUser.id,
        duplicateUser.password,
        duplicateUser.nickname
      );

      // 중복 등록 시도
      await expect(
        ApiService.register(
          duplicateUser.id,
          duplicateUser.password,
          duplicateUser.nickname
        )
      ).rejects.toMatchObject({
        statusCode: 409,
        message: '이미 사용중인 아이디입니다.'
      });
    });

    test('should validate password length', async () => {
      await expect(
        ApiService.register('short', '123', 'nickname')
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.arrayContaining([
          'password must be longer than or equal to 4 characters'
        ])
      });
    });

    test('should handle wrong credentials', async () => {
      await expect(
        ApiService.login('nonexistent', 'wrongpassword')
      ).rejects.toMatchObject({
        statusCode: 401,
        message: '아이디 또는 비밀번호가 잘못되었습니다.'
      });
    });
  });
});