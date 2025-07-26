// API 디버깅 테스트
// @ts-ignore
global.fetch = require('node-fetch');

const BASE_URL = 'http://api.hjun.kr/hackathon';

describe('API Debug Tests', () => {
  test('Direct API call - Register with duplicate ID', async () => {
    console.log('\n===== Direct API Test: Register =====');
    
    const testData = {
      id: 'Aodwpdn',  // 이미 존재하는 ID로 테스트
      password: 'test1234',
      nickname: '맹제우'
    };
    
    console.log('Request URL:', `${BASE_URL}/auth/register`);
    console.log('Request data:', testData);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('\n📡 Response received:');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('OK:', response.ok);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('\n📦 Response data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (response.status === 409) {
        console.log('\n✅ Expected error: Duplicate ID');
        expect(data.statusCode).toBe(409);
        expect(data.message).toBe('이미 사용중인 아이디입니다.');
      }
      
    } catch (error: any) {
      console.log('\n❌ Network/Parse error:');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      throw error;
    }
  });

  test('Direct API call - Register with new ID', async () => {
    console.log('\n===== Direct API Test: New Registration =====');
    
    const testData = {
      id: `testuser${Date.now()}`,  // 고유한 ID
      password: 'test1234',
      nickname: '테스트유저'
    };
    
    console.log('Request URL:', `${BASE_URL}/auth/register`);
    console.log('Request data:', testData);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('\n📡 Response received:');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('OK:', response.ok);
      
      const data = await response.json();
      console.log('\n📦 Response data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (response.status === 201 || response.status === 200) {
        console.log('\n✅ Registration successful');
        expect(data.message).toBe('회원가입이 완료되었습니다.');
        expect(data.user.id).toBe(testData.id);
      }
      
    } catch (error: any) {
      console.log('\n❌ Network/Parse error:');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      throw error;
    }
  });

  test('Direct API call - Login with wrong credentials', async () => {
    console.log('\n===== Direct API Test: Login Error =====');
    
    const testData = {
      id: 'wronguser',
      password: 'wrongpass'
    };
    
    console.log('Request URL:', `${BASE_URL}/auth/login`);
    console.log('Request data:', { ...testData, password: '***' });
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('\n📡 Response received:');
      console.log('Status:', response.status);
      console.log('StatusText:', response.statusText);
      console.log('OK:', response.ok);
      
      const data = await response.json();
      console.log('\n📦 Response data:');
      console.log(JSON.stringify(data, null, 2));
      
      if (response.status === 401) {
        console.log('\n✅ Expected error: Wrong credentials');
        expect(data.statusCode).toBe(401);
        expect(data.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
      }
      
    } catch (error: any) {
      console.log('\n❌ Network/Parse error:');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Full error:', error);
      throw error;
    }
  });
});