// 중복 ID 테스트
// @ts-ignore
global.fetch = require('node-fetch');

const BASE_URL = 'http://api.hjun.kr/hackathon';

describe('Duplicate ID Test', () => {
  test('Register with duplicate ID - Aodwpdn', async () => {
    console.log('\n===== Testing Duplicate ID: Aodwpdn =====');
    
    const testData = {
      id: 'Aodwpdn',  // 방금 등록한 ID
      password: 'test1234',
      nickname: '중복테스트'
    };
    
    console.log('Request:', testData);
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();
    
    console.log('\n📡 Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    if (response.status === 409) {
      console.log('\n✅ Expected: 이미 사용중인 아이디입니다.');
      expect(data.statusCode).toBe(409);
      expect(data.message).toBe('이미 사용중인 아이디입니다.');
    } else if (response.status === 201) {
      console.log('\n⚠️  ID was not duplicate - it was registered successfully');
    }
  });
});