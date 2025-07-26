import AsyncStorage from './storage';
import { personalityTestQuestions, personalityTestCharacters, calculatePersonalityTestResult } from './personalityTestData';

const BASE_URL = 'http://api.hjun.kr/hackathon';

export interface User {
  idx: number;
  id: string;
  nickname: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

export interface ErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

class ApiService {
  private static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  private static async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  static async login(id: string, password: string): Promise<LoginResponse> {
    try {
      console.log('[API] Login request:', { id, password: '***' });
      
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();
      console.log('[API] Login response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      if (!response.ok) {
        console.log('[API] Login error:', data);
        throw data;
      }

      // 토큰세이브
      await this.saveToken(data.accessToken);

      return data;
    } catch (error) {
      console.log('[API] Login exception:', error);
      throw error;
    }
  }

  static async register(id: string, password: string, nickname: string): Promise<RegisterResponse> {
    console.log('[API] Register request:', { id, password: '***', nickname });
    console.log('[API] URL:', `${BASE_URL}/auth/register`);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password, nickname }),
      });

      console.log('[API] Response status:', response.status);
      console.log('[API] Response statusText:', response.statusText);
      console.log('[API] Response headers:', response.headers);
      
      const data = await response.json();
      console.log('[API] Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.log('[API] ❌ Register failed with status:', response.status);
        console.log('[API] ❌ Error data:', data);
        throw data;
      }

      console.log('[API] ✅ Register success');
      return data;
    } catch (error: any) {
      console.log('[API] ❌ Register exception:');
      console.log('[API] Error type:', error.constructor.name);
      console.log('[API] Error message:', error.message || error);
      console.log('[API] Full error:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<ProfileResponse> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(response);

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async checkAuth(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const profile = await this.getProfile();
      return !!profile.user;
    } catch (error) {
      return false;
    }
  }

  static async get(endpoint: string): Promise<any> {
    // Personality Test 엔드포인트는 로컬 데이터 사용 (서버 API 미구현)
    if (endpoint === '/personality-test/questions') {
      console.log('[API] Using local data for personality-test/questions');
      return Promise.resolve(personalityTestQuestions);
    }
    
    if (endpoint === '/personality-test/characters') {
      console.log('[API] Using local data for personality-test/characters');
      return Promise.resolve(personalityTestCharacters);
    }

    try {
      const token = await this.getToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`[API] GET request to: ${BASE_URL}${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      console.log('[API] GET response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        console.log('[API] GET error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      console.log('[API] GET exception:', error);
      throw error;
    }
  }

  static async post(endpoint: string, body: any): Promise<any> {
    // Personality Test 결과 엔드포인트는 로컬에서 계산 (서버 API 미구현)
    if (endpoint === '/personality-test/result') {
      console.log('[API] Using local calculation for personality-test/result');
      console.log('[API] Answers:', body.answers);
      
      if (!body.answers || !Array.isArray(body.answers) || body.answers.length !== 10) {
        throw {
          statusCode: 400,
          message: 'Invalid answers format'
        };
      }
      
      const result = calculatePersonalityTestResult(body.answers);
      console.log('[API] Calculated result:', result);
      return Promise.resolve(result);
    }

    try {
      const token = await this.getToken();
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`[API] POST request to: ${BASE_URL}${endpoint}`);
      console.log('[API] POST body:', body);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('[API] POST response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        console.log('[API] POST error:', data);
        throw data;
      }

      return data;
    } catch (error) {
      console.log('[API] POST exception:', error);
      throw error;
    }
  }
}

export default ApiService;