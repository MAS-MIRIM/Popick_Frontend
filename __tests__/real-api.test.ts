/**
 * 실제 API 서버와의 연결을 테스트합니다.
 * 이 테스트는 실제 네트워크 요청을 수행합니다.
 */

const BASE_URL = 'http://api.hjun.kr/hackathon';

describe('Real API Connection Tests', () => {
  // 테스트용 고유 ID 생성
  const timestamp = Date.now();
  const testUserId = `testuser_${timestamp}`;
  const testPassword = 'test1234';
  const testNickname = `테스트유저_${timestamp}`;
  
  let authToken: string | null = null;

  describe('회원가입 API', () => {
    it('신규 사용자 회원가입', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testUserId,
          password: testPassword,
          nickname: testNickname,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Register error:', error);
        
        // register가 아닌 다른 엔드포인트일 수 있음
        if (response.status === 404) {
          console.log('Trying /auth/signup endpoint...');
          const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: testUserId,
              password: testPassword,
              nickname: testNickname,
            }),
          });
          
          if (signupResponse.ok) {
            const data = await signupResponse.json();
            expect(data.message).toBe('회원가입이 완료되었습니다.');
            expect(data.user).toBeDefined();
            expect(data.user.id).toBe(testUserId);
            return;
          }
        }
      }

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe('회원가입이 완료되었습니다.');
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUserId);
      expect(data.user.nickname).toBe(testNickname);
    });

    it('중복 아이디로 회원가입 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testUserId,
          password: testPassword,
          nickname: '다른닉네임',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(409);
      expect(data.message).toBe('이미 사용중인 아이디입니다.');
      expect(data.statusCode).toBe(409);
    });

    it('짧은 비밀번호로 회원가입 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `short_${timestamp}`,
          password: '123',
          nickname: '짧은비번',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.statusCode).toBe(400);
      expect(Array.isArray(data.message)).toBe(true);
      expect(data.message[0]).toContain('password must be longer than or equal to 4 characters');
    });
  });

  describe('로그인 API', () => {
    it('올바른 정보로 로그인', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testUserId,
          password: testPassword,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.accessToken).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUserId);
      expect(data.user.nickname).toBe(testNickname);
      
      // 프로필 조회를 위해 토큰 저장
      authToken = data.accessToken;
    });

    it('잘못된 비밀번호로 로그인 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testUserId,
          password: 'wrongpassword',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
      expect(data.statusCode).toBe(401);
    });

    it('존재하지 않는 아이디로 로그인 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'nonexistent_user_999999',
          password: 'anypassword',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.message).toBe('아이디 또는 비밀번호가 잘못되었습니다.');
    });
  });

  describe('프로필 조회 API', () => {
    it('유효한 토큰으로 프로필 조회', async () => {
      expect(authToken).toBeTruthy();
      
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.message).toBe('로그인된 사용자 정보입니다.');
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe(testUserId);
      expect(data.user.nickname).toBe(testNickname);
    });

    it('토큰 없이 프로필 조회 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
    });

    it('잘못된 토큰으로 프로필 조회 시도', async () => {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid_token_12345',
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
    });
  });
});