import ApiService from '../utils/api';

describe('Real PersonalityTest API Integration', () => {
  beforeAll(() => {
    // 실제 fetch 사용
    global.fetch = require('node-fetch');
  });

  describe('GET /personality-test/questions - Real API', () => {
    it('should fetch actual questions from the API', async () => {
      try {
        const questions = await ApiService.get('/personality-test/questions');
        
        // 기본 구조 검증
        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
        
        // 첫 번째 질문 구조 검증
        const firstQuestion = questions[0];
        expect(firstQuestion).toHaveProperty('id');
        expect(firstQuestion).toHaveProperty('question');
        expect(firstQuestion).toHaveProperty('optionA');
        expect(firstQuestion).toHaveProperty('optionB');
        expect(firstQuestion).toHaveProperty('charactersA');
        expect(firstQuestion).toHaveProperty('charactersB');
        expect(firstQuestion).toHaveProperty('charactersAKo');
        expect(firstQuestion).toHaveProperty('charactersBKo');
        
        // 데이터 타입 검증
        expect(typeof firstQuestion.id).toBe('number');
        expect(typeof firstQuestion.question).toBe('string');
        expect(typeof firstQuestion.optionA).toBe('string');
        expect(typeof firstQuestion.optionB).toBe('string');
        expect(Array.isArray(firstQuestion.charactersA)).toBe(true);
        expect(Array.isArray(firstQuestion.charactersB)).toBe(true);
        
        console.log('✅ Successfully fetched questions:', questions.length);
        console.log('First question:', firstQuestion.question);
      } catch (error) {
        console.error('❌ Failed to fetch questions:', error);
        throw error;
      }
    });
  });

  describe('GET /personality-test/characters - Real API', () => {
    it('should fetch actual characters from the API', async () => {
      try {
        const characters = await ApiService.get('/personality-test/characters');
        
        // 기본 구조 검증
        expect(typeof characters).toBe('object');
        expect(Object.keys(characters).length).toBeGreaterThan(0);
        
        // 각 캐릭터 구조 검증
        const characterIds = Object.keys(characters);
        characterIds.forEach(id => {
          const character = characters[id];
          expect(character).toHaveProperty('name');
          expect(character).toHaveProperty('nameKo');
          expect(character).toHaveProperty('description');
          expect(character).toHaveProperty('traits');
          expect(Array.isArray(character.traits)).toBe(true);
        });
        
        console.log('✅ Successfully fetched characters:', characterIds);
      } catch (error) {
        console.error('❌ Failed to fetch characters:', error);
        throw error;
      }
    });
  });

  describe('POST /personality-test/result - Real API', () => {
    it('should submit answers and get result from the API', async () => {
      try {
        const testAnswers = ["A", "B", "A", "B", "A", "B", "A", "A", "A", "B"];
        const result = await ApiService.post('/personality-test/result', {
          answers: testAnswers
        });
        
        // 결과 구조 검증
        expect(result).toHaveProperty('character');
        expect(result).toHaveProperty('scores');
        expect(result).toHaveProperty('matchPercentage');
        
        // 캐릭터 정보 검증
        expect(result.character).toHaveProperty('name');
        expect(result.character).toHaveProperty('nameKo');
        expect(result.character).toHaveProperty('description');
        expect(result.character).toHaveProperty('traits');
        
        // 점수 검증
        expect(typeof result.scores).toBe('object');
        expect(typeof result.matchPercentage).toBe('number');
        
        console.log('✅ Successfully submitted answers and got result:');
        console.log('Character:', result.character.nameKo);
        console.log('Match percentage:', result.matchPercentage);
      } catch (error) {
        console.error('❌ Failed to submit answers:', error);
        throw error;
      }
    });

    it('should handle invalid answers format', async () => {
      try {
        await ApiService.post('/personality-test/result', {
          answers: []  // 빈 배열
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeDefined();
        console.log('✅ Correctly handled invalid answers:', error.message || error);
      }
    });
  });
});