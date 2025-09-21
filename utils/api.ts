import AsyncStorage from './storage';
import {
  personalityTestQuestions,
  personalityTestCharacters,
  calculatePersonalityTestResult,
  PersonalityTestResult,
} from './personalityTestData';

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

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  duration: string;
  viewCount: string;
}

export interface YouTubeShortsResponse {
  videos: YouTubeVideo[];
  hasMore: boolean;
  currentPage: string;
  totalResults: number;
  elapsedTimeMs: number;
}

class ApiService {
  private static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      return null;
    }
  }

  private static async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('accessToken', token);
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('accessToken');
  }

  static async login(id: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id, password}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      await this.saveToken(data.accessToken);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async register(
    id: string,
    password: string,
    nickname: string,
  ): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id, password, nickname}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getProfile(): Promise<ProfileResponse> {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
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
    if (endpoint === '/personality-test/questions') return personalityTestQuestions;

    if (endpoint === '/personality-test/characters') return personalityTestCharacters;

    const token = await this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  static async post(endpoint: string, body: any): Promise<any> {
    if (endpoint === '/personality-test/result') {
      if (
        !body.answers ||
        !Array.isArray(body.answers) ||
        body.answers.length !== 10
      ) {
        throw {
          statusCode: 400,
          message: 'Invalid answers format',
        };
      }

      return calculatePersonalityTestResult(body.answers);
    }

    const token = await this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  static async savePersonalityTestResult(
    result: PersonalityTestResult,
  ): Promise<void> {
    await AsyncStorage.setItem('personalityTestResult', JSON.stringify(result));
    await AsyncStorage.setItem('hasCompletedPersonalityTest', 'true');
  }

  static async getYouTubeShorts(
    search: string,
    userId: string,
    page: number = 1,
    limit: number = 5,
  ): Promise<YouTubeShortsResponse> {
    const token = await this.getToken();
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/youtube/shorts?page=${page}&limit=${limit}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({search, userId}),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    if (!data.videos || !Array.isArray(data.videos)) {
      throw new Error('Invalid response format from YouTube shorts API');
    }

    return data;
  }
}

export default ApiService;
