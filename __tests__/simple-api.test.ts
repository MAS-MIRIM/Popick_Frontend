// Simple test to verify API is working
const BASE_URL = 'http://api.hjun.kr/hackathon';

describe('Simple API Test', () => {
  test('API is reachable', async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 'test', password: 'test' }),
      });
      
      // We expect 401 because credentials are wrong, but this proves API is reachable
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
      
      console.log('✅ API is reachable and responding correctly');
    } catch (error) {
      console.error('❌ API connection failed:', error);
      throw error;
    }
  });
});