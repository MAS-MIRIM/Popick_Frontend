import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PersonalityTestScreen from '../screens/PersonalityTestScreen';
import ApiService from '../utils/api';

// ApiService는 이미 로컬 데이터를 사용하도록 구현되어 있으므로 모킹하지 않음

describe('PersonalityTestScreen Integration Test', () => {
  const mockOnComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full quiz flow successfully', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    // 질문이 로드될 때까지 대기
    await waitFor(() => {
      expect(getByText('1/10')).toBeTruthy();
      expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
    });

    // 10개의 질문에 모두 답변
    const expectedQuestions = [
      '혼자 있는게 편한가요?',
      '감정을 얼굴에 잘 드러내나요?',
      '새로운 걸 탐험하는 걸 좋아하나요?',
      '기분이 좋을 때가 많나요?',
      '종종 외롭다고 느끼나요?',
      '마음속에 어둠과 빛 둘 다 있다고 생각하나요?',
      '누가 신비롭다고 말한 적 있나요?',
      '부끄럼을 많이 타나요?',
      '눈물이 많고 감수성이 풍부한가요?',
      '지금도 자라고 있나요?'
    ];

    for (let i = 0; i < 10; i++) {
      // 현재 질문 확인
      expect(getByText(`${i + 1}/10`)).toBeTruthy();
      expect(getByText(expectedQuestions[i])).toBeTruthy();
      
      // 첫 번째 옵션 선택 (O 버튼)
      const optionButtons = getByText(expectedQuestions[i]).parent.parent.findAllByType('TouchableOpacity');
      // 첫 번째 옵션 버튼 찾기 (O가 있는 버튼)
      const firstOption = optionButtons[0];
      fireEvent.press(firstOption);
      
      // 다음으로 버튼 클릭
      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);
      
      // 마지막 질문이 아니면 다음 질문 로드 대기
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`${i + 2}/10`)).toBeTruthy();
        });
      }
    }

    // 결과가 계산되고 onComplete가 호출되는지 확인
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          character: expect.objectContaining({
            name: expect.any(String),
            nameKo: expect.any(String),
            description: expect.any(String),
            traits: expect.any(Array)
          }),
          scores: expect.any(Object),
          matchPercentage: expect.any(Number)
        })
      );
    });
  });

  it('should handle mixed answers correctly', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('1/10')).toBeTruthy();
    });

    // 섞어서 답변 (A, B 번갈아가며)
    const answerPattern = ['네, 조용한 게 좋아요', '아니요, 거의 드러내지 않아요', '네! 모험은 즐거워요', '아니요, 기분이 자주 왔다 갔다 해요', '네, 그런 적이 있어요'];
    
    for (let i = 0; i < 5; i++) {
      const option = getByText(answerPattern[i]);
      fireEvent.press(option);
      
      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);
      
      if (i < 4) {
        await waitFor(() => {
          expect(getByText(`${i + 2}/10`)).toBeTruthy();
        });
      }
    }

    // 나머지 질문들도 완료
    const remainingOptions = ['맞아요, 두 가지 다 있어요', '아니요, 전 그냥 장난꾸러기에요', '네, 낯가림이 심해요', '아니요, 감정보다 이성적으로 생각해요', '네, 성장 중이에요'];
    
    for (let i = 5; i < 10; i++) {
      const option = getByText(remainingOptions[i - 5]);
      fireEvent.press(option);
      
      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);
      
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`${i + 2}/10`)).toBeTruthy();
        });
      }
    }

    // 결과 확인
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
      const result = mockOnComplete.mock.calls[0][0];
      expect(result.matchPercentage).toBeGreaterThan(0);
      expect(result.matchPercentage).toBeLessThanOrEqual(100);
    });
  });
});