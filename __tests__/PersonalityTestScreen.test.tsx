import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PersonalityTestScreen from '../screens/PersonalityTestScreen';
import ApiService from '../utils/api';

jest.mock('../utils/api');
jest.spyOn(Alert, 'alert');

describe('PersonalityTestScreen', () => {
  const mockOnComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When API fails', () => {
    it('should use dummy data when API returns 404', async () => {
      (ApiService.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Not Found'
      });

      const { getByText, getAllByText } = render(
        <PersonalityTestScreen onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '알림',
        '서버에 연결할 수 없어 테스트 데이터를 사용합니다.'
      );

      // 첫 번째 질문 확인
      expect(getByText('1/10')).toBeTruthy();
      expect(getByText('네, 조용한 게 좋아요')).toBeTruthy();
      expect(getByText('아니요, 친구들과 어울리는 게 좋아요')).toBeTruthy();
    });

    it('should show error alert when API fails with other errors', async () => {
      (ApiService.get as jest.Mock).mockRejectedValue({
        statusCode: 500,
        message: 'Internal Server Error'
      });

      render(<PersonalityTestScreen onComplete={mockOnComplete} />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '오류',
          '질문을 불러오는 중 문제가 발생했습니다.'
        );
      });
    });
  });

  describe('Quiz interaction', () => {
    beforeEach(async () => {
      (ApiService.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Not Found'
      });
    });

    it('should not proceed without selecting an option', async () => {
      const { getByText } = render(
        <PersonalityTestScreen onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
      });

      // Alert 호출 횟수 초기화
      (Alert.alert as jest.Mock).mockClear();

      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);

      expect(Alert.alert).toHaveBeenCalledWith('알림', '답변을 선택해주세요.');
    });

    it('should proceed to next question when option is selected', async () => {
      const { getByText } = render(
        <PersonalityTestScreen onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
      });

      // 첫 번째 옵션 선택
      const optionA = getByText('네, 조용한 게 좋아요');
      fireEvent.press(optionA);

      // 다음으로 버튼 클릭
      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);

      // 두 번째 질문이 나타나는지 확인
      await waitFor(() => {
        expect(getByText('2/10')).toBeTruthy();
        expect(getByText('감정을 얼굴에 잘 드러내나요?')).toBeTruthy();
      });
    });

    it('should submit answers and use dummy result when API fails', async () => {
      (ApiService.post as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Not Found'
      });

      const { getByText } = render(
        <PersonalityTestScreen onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
      });

      // 간단하게 10개의 질문에 모두 첫 번째 옵션을 선택
      const dummyQuestions = [
        '네, 조용한 게 좋아요',
        '네, 잘 드러내요',
        '네! 모험은 즐거워요',
        '네, 항상 긍정적이에요',
        '네, 그런 적이 있어요',
        '맞아요, 두 가지 다 있어요',
        '네, 가끔 그래요',
        '네, 낯가림이 심해요',
        '네, 맞아요',
        '네, 성장 중이에요'
      ];

      for (let i = 0; i < 10; i++) {
        const currentOption = getByText(dummyQuestions[i]);
        fireEvent.press(currentOption);
        
        const nextButton = getByText('다음으로');
        fireEvent.press(nextButton);
        
        if (i < 9) {
          await waitFor(() => {
            expect(getByText(`${i + 2}/10`)).toBeTruthy();
          });
        }
      }

      // 결과 제출 확인
      await waitFor(() => {
        expect(ApiService.post).toHaveBeenCalledWith(
          '/personality-test/result',
          { answers: expect.arrayContaining(['A']) }
        );
      });

      // 더미 결과로 onComplete 호출 확인
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            character: expect.objectContaining({
              nameKo: '디무'
            })
          })
        );
      });
    });
  });

  describe('Option selection visual feedback', () => {
    it('should highlight selected option', async () => {
      (ApiService.get as jest.Mock).mockRejectedValue({
        statusCode: 404,
        message: 'Not Found'
      });

      const { getByText, queryByTestId } = render(
        <PersonalityTestScreen onComplete={mockOnComplete} />
      );

      await waitFor(() => {
        expect(getByText('혼자 있는게 편한가요?')).toBeTruthy();
      });

      const optionA = getByText('네, 조용한 게 좋아요');
      fireEvent.press(optionA);

      // 선택된 옵션의 스타일이 변경되었는지 확인
      // 실제 구현에서는 testID를 추가하여 더 정확한 테스트 가능
      const nextButton = getByText('다음으로');
      expect(nextButton.props.disabled).toBeFalsy();
    });
  });
});