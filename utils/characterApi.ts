import AsyncStorage from './storage';

// iOS 시뮬레이터에서는 localhost 또는 127.0.0.1 사용 가능
const BASE_URL = 'http://api.hjun.kr/hackathon';

export interface Character {
  id: string;
  name: string;
  nameKo: string;
  series: string;
  seriesKo: string;
  description: string;
  imageUrl: string;
  popmartUrl: string;
}

export interface CharacterInfo {
  id: string;
  name: string;
  nameKo: string;
  series: string;
  seriesKo: string;
  description: string;
  price?: number;
  releaseDate?: string;
  images: string[];
}

class CharacterAPI {
  // 모든 캐릭터 목록 가져오기
  async getAllCharacters(): Promise<Character[]> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('[CharacterAPI] Fetching from:', `${BASE_URL}/characters/`);
      
      // "/characters/" 경로로 호출
      const response = await fetch(`${BASE_URL}/characters/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CharacterAPI] Response data:', data);
      
      // API 응답에서 이미지 배열 추출
      const images = data.images || [];
      console.log('[CharacterAPI] Total images:', images.length);
      
      // 캐릭터별로 그룹화 (중복 제거)
      const characterMap = new Map<string, any>();
      
      images.forEach((item: any) => {
        const category = item.category;
        const characterInfo = item.characterInfo;
        
        if (!characterMap.has(category) && characterInfo) {
          characterMap.set(category, {
            id: category,
            name: characterInfo.name || category.replace('char-', ''),
            nameKo: characterInfo.name || characterInfo.description?.split(' ')[0] || category.replace('char-', ''),
            series: item.parsedInfo?.koSeries || '',
            seriesKo: item.parsedInfo?.koSeries || '',
            description: characterInfo.description || '',
            imageUrl: item.url.startsWith('http') ? item.url : `https://${item.url}`,
            popmartUrl: `https://www.popmart.com/${characterInfo.name || category}`,
          });
        }
      });
      
      const characters = Array.from(characterMap.values());
      console.log('[CharacterAPI] Unique characters:', characters.length);
      
      return characters;
    } catch (error) {
      console.error('[CharacterAPI] Error fetching characters:', error);
      // 백엔드 연결 실패시 로컬 데이터 사용
      return this.getLocalCharacters();
    }
  }

  // 특정 캐릭터 정보 가져오기
  async getCharacterInfo(characterId: string): Promise<CharacterInfo | null> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${BASE_URL}/characters/${characterId}/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch character info: ${response.status}`);
      }

      const data = await response.json();
      console.log('[CharacterAPI] Fetched character info:', data);
      
      return data;
    } catch (error) {
      console.error('[CharacterAPI] Error fetching character info:', error);
      return null;
    }
  }

  // 특정 캐릭터의 이미지 가져오기
  getCharacterImageUrl(characterId: string, imageIndex: number = 0): string {
    // char-로 시작하지 않으면 추가
    const formattedId = characterId.startsWith('char-') ? characterId : `char-${characterId.toLowerCase()}`;
    // 직접 이미지 URL 반환 (CDN URL)
    return `https://api.hjun.kr/static/${formattedId}/${imageIndex}`;
  }

  // 캐릭터 데이터를 캐시에 저장
  async cacheCharacters(characters: Character[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedCharacters', JSON.stringify(characters));
      await AsyncStorage.setItem('cachedCharactersTimestamp', Date.now().toString());
    } catch (error) {
      console.error('[CharacterAPI] Error caching characters:', error);
    }
  }

  // 캐시된 캐릭터 데이터 가져오기 (1시간 유효)
  async getCachedCharacters(): Promise<Character[] | null> {
    try {
      const timestamp = await AsyncStorage.getItem('cachedCharactersTimestamp');
      if (!timestamp) return null;

      const now = Date.now();
      const cacheAge = now - parseInt(timestamp);
      const ONE_HOUR = 60 * 60 * 1000;

      if (cacheAge > ONE_HOUR) {
        console.log('[CharacterAPI] Cache expired');
        return null;
      }

      const cachedData = await AsyncStorage.getItem('cachedCharacters');
      if (!cachedData) return null;

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('[CharacterAPI] Error getting cached characters:', error);
      return null;
    }
  }

  // 캐시 클리어
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cachedCharacters');
      await AsyncStorage.removeItem('cachedCharactersTimestamp');
      console.log('[CharacterAPI] Cache cleared');
    } catch (error) {
      console.error('[CharacterAPI] Error clearing cache:', error);
    }
  }

  // 캐릭터 데이터 가져오기 (캐시 우선)
  async getCharacters(forceRefresh: boolean = false): Promise<Character[]> {
    // forceRefresh가 true면 캐시 무시
    if (!forceRefresh) {
      // 먼저 캐시 확인
      const cached = await this.getCachedCharacters();
      if (cached && cached.length > 0) {
        console.log('[CharacterAPI] Using cached characters:', cached.length);
        return cached;
      }
    }

    // 캐시가 없거나 강제 새로고침이면 API 호출
    const characters = await this.getAllCharacters();
    if (characters.length > 0) {
      await this.cacheCharacters(characters);
    }
    return characters;
  }

  // 로컬 캐릭터 데이터 (백엔드 연결 실패시 사용)
  private getLocalCharacters(): Character[] {
    const localData = [
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
      {
        id: 'char-dimoo',
        name: 'DIMOO',
        nameKo: '디무',
        series: 'DIMOO World',
        seriesKo: '디무 월드',
        description: '수수께끼 같은 매력의 디무',
      },
      {
        id: 'char-skullpanda',
        name: 'SKULLPANDA',
        nameKo: '스컬판다',
        series: 'SKULLPANDA Everyday',
        seriesKo: '스컬판다 에브리데이',
        description: '독특한 스타일의 스컬판다',
      },
      {
        id: 'char-kubo',
        name: 'KUBO',
        nameKo: '쿠보',
        series: 'KUBO Space',
        seriesKo: '쿠보 스페이스',
        description: '우주를 좋아하는 쿠보',
      },
      {
        id: 'char-crybaby',
        name: 'CRYBABY',
        nameKo: '크라이베이비',
        series: 'CRYBABY Superstars',
        seriesKo: '크라이베이비 슈퍼스타',
        description: '눈물이 많은 크라이베이비',
      },
      {
        id: 'char-hachi',
        name: 'HACHI',
        nameKo: '하치',
        series: 'HACHI Mechanic',
        seriesKo: '하치 메카닉',
        description: '로봇 강아지 하치',
      },
      {
        id: 'char-pooky',
        name: 'POOKY',
        nameKo: '푸키',
        series: 'POOKY Bear',
        seriesKo: '푸키 베어',
        description: '복잡한 내면을 가지고 있으며 기분 변화가 있는 캐릭터',
      },
      {
        id: 'char-rabubu',
        name: 'RABUBU',
        nameKo: '라부부',
        series: 'RABUBU Series',
        seriesKo: '라부부 시리즈',
        description: '귀여운 캐릭터',
      },
      {
        id: 'char-jigger',
        name: 'JIGGER',
        nameKo: '지거',
        series: 'JIGGER Series',
        seriesKo: '지거 시리즈',
        description: '활발한 캐릭터',
      },
      {
        id: 'char-pinojelly',
        name: 'PINOJELLY',
        nameKo: '피노젤리',
        series: 'PINOJELLY Series',
        seriesKo: '피노젤리 시리즈',
        description: '달콤한 캐릭터',
      }
    ];

    // 로컬 데이터에 이미지 URL 추가 (CDN URL 사용)
    return localData.map(char => ({
      ...char,
      imageUrl: `https://api.hjun.kr/static/${char.id}/${char.name.toLowerCase()}_0.png`,
      popmartUrl: `https://www.popmart.com/${char.name.toLowerCase()}`,
    }));
  }
}

export default new CharacterAPI();