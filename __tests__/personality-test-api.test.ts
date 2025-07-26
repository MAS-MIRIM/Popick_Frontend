import ApiService from '../utils/api';
import { personalityTestQuestions, personalityTestCharacters } from '../utils/personalityTestData';

describe('PersonalityTest API with Local Data', () => {
  describe('GET /personality-test/questions', () => {
    it('should return local questions data', async () => {
      const result = await ApiService.get('/personality-test/questions');
      
      expect(result).toEqual(personalityTestQuestions);
      expect(result.length).toBe(10);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('question');
      expect(result[0]).toHaveProperty('optionA');
      expect(result[0]).toHaveProperty('optionB');
    });
  });

  describe('GET /personality-test/characters', () => {
    it('should return local characters data', async () => {
      const result = await ApiService.get('/personality-test/characters');
      
      expect(result).toEqual(personalityTestCharacters);
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result.dimu).toBeDefined();
      expect(result.dimu.nameKo).toBe('디무');
    });
  });

  describe('POST /personality-test/result', () => {
    it('should calculate result from answers', async () => {
      const answers = ["A", "B", "A", "B", "A", "B", "A", "A", "A", "B"];
      const result = await ApiService.post('/personality-test/result', {
        answers: answers
      });
      
      expect(result).toHaveProperty('character');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('matchPercentage');
      
      expect(result.character).toHaveProperty('name');
      expect(result.character).toHaveProperty('nameKo');
      expect(result.character).toHaveProperty('description');
      expect(result.character).toHaveProperty('traits');
      
      expect(typeof result.matchPercentage).toBe('number');
      expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });

    it('should throw error for invalid answers', async () => {
      await expect(
        ApiService.post('/personality-test/result', { answers: [] })
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Invalid answers format'
      });

      await expect(
        ApiService.post('/personality-test/result', { answers: ['A', 'B'] })
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Invalid answers format'
      });

      await expect(
        ApiService.post('/personality-test/result', { })
      ).rejects.toEqual({
        statusCode: 400,
        message: 'Invalid answers format'
      });
    });

    it('should return consistent results for same answers', async () => {
      const answers = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A"];
      
      const result1 = await ApiService.post('/personality-test/result', { answers });
      const result2 = await ApiService.post('/personality-test/result', { answers });
      
      expect(result1).toEqual(result2);
    });

    it('should return different results for different answers', async () => {
      const answersA = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A"];
      const answersB = ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B"];
      
      const resultA = await ApiService.post('/personality-test/result', { answers: answersA });
      const resultB = await ApiService.post('/personality-test/result', { answers: answersB });
      
      expect(resultA.character.name).not.toBe(resultB.character.name);
    });
  });
});