import ApiService, { YouTubeShortsResponse } from '../utils/api';

// Mock fetch
global.fetch = jest.fn();

describe('YouTube Shorts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getYouTubeShorts', () => {
    const mockResponse: YouTubeShortsResponse = {
      videos: [
        {
          id: '6YcNPmcHPng',
          title: '라부부 짝퉁 사면 100만원 잃을지도 .. 😭',
          thumbnail: 'https://i.ytimg.com/vi/6YcNPmcHPng/default.jpg',
          channelTitle: '싹다모아 꿀템 , 쿠팡템',
          publishedAt: '2025-07-07T09:00:17Z',
          url: 'https://www.youtube.com/watch?v=6YcNPmcHPng',
          duration: '0:24',
          viewCount: '2877357',
        },
      ],
      hasMore: true,
      currentPage: '1',
      totalResults: 1,
      elapsedTimeMs: 1013,
    };

    it('should fetch YouTube shorts successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await ApiService.getYouTubeShorts('라부부', 'gaon', 1, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/youtube/shorts?page=1&limit=5',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search: '라부부', userId: 'gaon' }),
        }
      );

      expect(result).toEqual(mockResponse);
      expect(result.videos).toHaveLength(1);
      expect(result.videos[0].id).toBe('6YcNPmcHPng');
    });

    it('should include authorization header when token exists', async () => {
      // Mock getToken to return a token
      const mockToken = 'test-auth-token';
      jest.spyOn(ApiService as any, 'getToken').mockResolvedValueOnce(mockToken);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await ApiService.getYouTubeShorts('라부부', 'gaon', 1, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/youtube/shorts?page=1&limit=5',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ search: '라부부', userId: 'gaon' }),
        }
      );
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        message: 'Invalid request',
        error: 'Bad Request',
        statusCode: 400,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(
        ApiService.getYouTubeShorts('라부부', 'gaon', 1, 5)
      ).rejects.toEqual(errorResponse);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(
        ApiService.getYouTubeShorts('라부부', 'gaon', 1, 5)
      ).rejects.toThrow('Network error');
    });

    it('should use default values for page and limit', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await ApiService.getYouTubeShorts('라부부', 'gaon');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/youtube/shorts?page=1&limit=5',
        expect.any(Object)
      );
    });

    it('should handle pagination correctly', async () => {
      const page2Response: YouTubeShortsResponse = {
        ...mockResponse,
        currentPage: '2',
        videos: [
          {
            id: 'different-id',
            title: 'Different video',
            thumbnail: 'https://i.ytimg.com/vi/different-id/default.jpg',
            channelTitle: 'Different Channel',
            publishedAt: '2025-07-08T09:00:17Z',
            url: 'https://www.youtube.com/watch?v=different-id',
            duration: '0:30',
            viewCount: '100000',
          },
        ],
        hasMore: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => page2Response,
      });

      const result = await ApiService.getYouTubeShorts('라부부', 'gaon', 2, 5);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/youtube/shorts?page=2&limit=5',
        expect.any(Object)
      );

      expect(result.currentPage).toBe('2');
      expect(result.hasMore).toBe(false);
    });
  });
});