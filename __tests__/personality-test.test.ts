import { renderHook, waitFor } from '@testing-library/react-native';
import ApiService from '../utils/api';

describe('PersonalityTest API', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /personality-test/questions', () => {
    it('should fetch questions successfully', async () => {
      const mockQuestions = [
        {
          id: 1,
          question: "혼자 있는게 편한가요?",
          optionA: "네, 조용한 게 좋아요",
          optionB: "아니요, 친구들과 어울리는 게 좋아요",
          charactersA: ["dimu", "kubo"],
          charactersB: ["rabubu", "molly"],
          charactersAKo: ["디무", "쿠보"],
          charactersBKo: ["라부부", "몰리"]
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuestions,
      });

      const result = await ApiService.get('/personality-test/questions');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/personality-test/questions',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      
      expect(result).toEqual(mockQuestions);
    });

    it('should handle fetch error gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      await expect(ApiService.get('/personality-test/questions')).rejects.toEqual({
        message: 'Internal server error'
      });
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(ApiService.get('/personality-test/questions')).rejects.toThrow('Network error');
    });
  });

  describe('POST /personality-test/result', () => {
    it('should submit answers successfully', async () => {
      const mockResult = {
        character: {
          name: "skullpanda",
          nameKo: "스컬판다",
          description: "신비롭고 차분하며 독립적인 성향의 캐릭터",
          traits: ["신비로움", "차분함", "이성적", "독립적"]
        },
        scores: {
          dimu: 0.7142857142857142,
          kubo: 0.6666666666666666,
          rabubu: 0.25,
          molly: 0.25,
          crybaby: 0.25,
          pinojelly: 0.25,
          skullpanda: 0.75,
          hachi: 0.5,
          jigger: 0.6666666666666666,
          pooky: 0.5
        },
        matchPercentage: 100
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResult,
      });

      const answers = ["A", "B", "A", "B", "A", "B", "A", "A", "A", "B"];
      const result = await ApiService.post('/personality-test/result', { answers });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.hjun.kr/hackathon/personality-test/result',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ answers }),
        })
      );
      
      expect(result).toEqual(mockResult);
    });

    it('should handle invalid answers format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid answers format' }),
      });

      await expect(
        ApiService.post('/personality-test/result', { answers: [] })
      ).rejects.toEqual({
        message: 'Invalid answers format'
      });
    });
  });

  describe('GET /personality-test/characters', () => {
    it('should fetch characters data successfully', async () => {
      const mockCharacters = {
        dimu: {
          name: "dimu",
          nameKo: "디무",
          description: "조용하고 내성적이지만 깊은 감성을 가진 캐릭터",
          traits: ["내향적", "감성적", "성장형", "외로움을 느끼기도 함"]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockCharacters,
      });

      const result = await ApiService.get('/personality-test/characters');
      
      expect(result).toEqual(mockCharacters);
    });
  });
});