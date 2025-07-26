// ApiService 통합 테스트
// @ts-ignore
global.fetch = require('node-fetch');

import ApiService from '../utils/api';
import AsyncStorage from '../utils/storage';

describe('ApiService Integration Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  test('ApiService - Register with duplicate ID (Aodwpdn)', async () => {
    console.log('\n===== ApiService Test: Duplicate Registration =====');
    
    try {
      await ApiService.register('Aodwpdn', 'test1234', '중복테스트2');
      // 성공하면 안됨
      fail('Should have thrown an error for duplicate ID');
    } catch (error: any) {
      console.log('\n✅ Caught expected error:');
      console.log('Error:', error);
      
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('이미 사용중인 아이디입니다.');
    }
  });

  test('ApiService - Complete flow: Register, Login, Get Profile', async () => {
    console.log('\n===== ApiService Test: Complete Flow =====');
    
    const uniqueId = `apitest${Date.now()}`;
    const testUser = {
      id: uniqueId,
      password: 'test1234!',
      nickname: 'API테스트'
    };
    
    // 1. 회원가입
    console.log('\n1️⃣ Register:');
    const registerResult = await ApiService.register(
      testUser.id, 
      testUser.password, 
      testUser.nickname
    );
    console.log('Register success:', registerResult.message);
    expect(registerResult.message).toBe('회원가입이 완료되었습니다.');
    
    // 2. 로그인
    console.log('\n2️⃣ Login:');
    const loginResult = await ApiService.login(testUser.id, testUser.password);
    console.log('Login success, token received');
    expect(loginResult.accessToken).toBeTruthy();
    expect(loginResult.user.id).toBe(testUser.id);
    
    // 토큰 저장 확인
    const savedToken = await AsyncStorage.getItem('accessToken');
    console.log('Token saved in storage:', savedToken ? 'Yes' : 'No');
    expect(savedToken).toBe(loginResult.accessToken);
    
    // 3. 프로필 조회
    console.log('\n3️⃣ Get Profile:');
    const profileResult = await ApiService.getProfile();
    console.log('Profile retrieved:', profileResult.user);
    expect(profileResult.user.id).toBe(testUser.id);
    expect(profileResult.user.nickname).toBe(testUser.nickname);
  });

  test('ApiService - Login with wrong credentials', async () => {
    console.log('\n===== ApiService Test: Login Error =====');
    
    try {
      await ApiService.login('wronguser', 'wrongpass');
      fail('Should have thrown an error for wrong credentials');
    } catch (error: any) {
      console.log('\n✅ Caught expected error:');
      console.log('Error:', error);
      
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  });

  test('ApiService - Profile without token', async () => {
    console.log('\n===== ApiService Test: Profile Without Token =====');
    
    try {
      await ApiService.getProfile();
      fail('Should have thrown an error for missing token');
    } catch (error: any) {
      console.log('\n✅ Caught expected error:');
      console.log('Error:', error.message);
      
      expect(error.message).toBe('No token found');
    }
  });
});