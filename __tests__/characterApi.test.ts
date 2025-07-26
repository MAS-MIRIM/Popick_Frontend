import CharacterAPI from '../utils/characterApi';
import AsyncStorage from '../utils/storage';

// Mock fetch
global.fetch = jest.fn();

describe('CharacterAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getAllCharacters', () => {
    it('should fetch characters from backend successfully', async () => {
      const mockCharacters = [
        {
          id: 'char-molly',
          name: 'MOLLY',
          nameKo: '몰리',
          series: 'MOLLY Career',
          seriesKo: '몰리 캐리어',
          description: '다양한 직업을 체험하는 몰리',
        },
        {
          id: 'char-labubu',
          name: 'LABUBU',
          nameKo: '라부부',
          series: 'LABUBU Have a Seat',
          seriesKo: '라부부 앉아있는 시리즈',
          description: '귀여운 이빨이 매력적인 라부부',
        },
      ];

      const mockApiResponse = {
        category: 'all',
        total: 2,
        images: [
          {
            category: 'char-molly',
            url: 'api.hjun.kr/static/char-molly/molly_peekaboo_black.png',
            characterInfo: {
              name: '몰리',
              description: '달콤한 몰리 캐릭터',
            },
            parsedInfo: {
              koSeries: '몰리 캐리어',
            },
          },
          {
            category: 'char-labubu',
            url: 'api.hjun.kr/static/char-labubu/rabubu_letsplaytogetherdollseries_baba.png',
            characterInfo: {
              name: '라부부',
              description: '사랑스러운 라부부 캐릭터',
            },
            parsedInfo: {
              koSeries: '라부부 앉아있는 시리즈',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await CharacterAPI.getAllCharacters();

      expect(fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/characters/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('char-molly');
      expect(result[0].imageUrl).toContain('api.hjun.kr/static/char-molly');
    });

    it('should return local characters when backend fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await CharacterAPI.getAllCharacters();

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('nameKo');
    });
  });

  describe('getCharacterInfo', () => {
    it('should fetch character info successfully', async () => {
      const mockCharacterInfo = {
        id: 'char-crybaby',
        name: 'CRYBABY',
        nameKo: '크라이베이비',
        series: 'CRYBABY Superstars',
        seriesKo: '크라이베이비 슈퍼스타',
        description: '눈물이 많은 크라이베이비',
        price: 50000,
        releaseDate: '2024-01-01',
        images: [
          'https://api.hjun.kr/static/char-crybaby/0',
          'https://api.hjun.kr/static/char-crybaby/1',
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharacterInfo,
      });

      const result = await CharacterAPI.getCharacterInfo('char-crybaby');

      expect(fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/characters/char-crybaby/info',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockCharacterInfo);
    });

    it('should return null when character info fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      const result = await CharacterAPI.getCharacterInfo('char-unknown');

      expect(result).toBeNull();
    });
  });

  describe('getCharacterImageUrl', () => {
    it('should format character image URL correctly', () => {
      const url1 = CharacterAPI.getCharacterImageUrl('char-molly', 0);
      expect(url1).toBe('https://api.hjun.kr/static/char-molly/0');

      const url2 = CharacterAPI.getCharacterImageUrl('molly', 1);
      expect(url2).toBe('https://api.hjun.kr/static/char-molly/1');
    });
  });

  describe('caching', () => {
    it('should cache characters and retrieve from cache', async () => {
      const mockCharacters = [
        {
          id: 'char-test',
          name: 'TEST',
          nameKo: '테스트',
          series: 'TEST Series',
          seriesKo: '테스트 시리즈',
          description: '테스트 캐릭터',
          imageUrl: 'http://test.com/test.png',
          popmartUrl: 'http://popmart.com/test',
        },
      ];

      // Mock AsyncStorage
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      const getItemSpy = jest.spyOn(AsyncStorage, 'getItem');

      // Cache characters
      await CharacterAPI.cacheCharacters(mockCharacters);

      expect(setItemSpy).toHaveBeenCalledWith('cachedCharacters', JSON.stringify(mockCharacters));
      expect(setItemSpy).toHaveBeenCalledWith('cachedCharactersTimestamp', expect.any(String));

      // Mock cached data retrieval
      getItemSpy.mockImplementation((key) => {
        if (key === 'cachedCharacters') return Promise.resolve(JSON.stringify(mockCharacters));
        if (key === 'cachedCharactersTimestamp') return Promise.resolve(Date.now().toString());
        return Promise.resolve(null);
      });

      const cached = await CharacterAPI.getCachedCharacters();
      expect(cached).toEqual(mockCharacters);
    });
  });
});