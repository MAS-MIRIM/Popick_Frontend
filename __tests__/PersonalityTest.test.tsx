import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PersonalityTestScreen from '../screens/PersonalityTestScreen';
import ApiService from '../utils/api';
import AsyncStorage from '../utils/storage';

// Mock dependencies
jest.mock('../utils/api');
jest.mock('../utils/storage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock the background image
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.ImageBackground = ({ children }) => children;
  return RN;
});

describe('PersonalityTestScreen', () => {
  const mockOnComplete = jest.fn();
  const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1}?`,
    optionA: 'Option A',
    optionB: 'Option B',
    charactersA: ['char1'],
    charactersB: ['char2'],
    charactersAKo: ['캐릭터1'],
    charactersBKo: ['캐릭터2'],
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiService.get as jest.Mock).mockResolvedValue(mockQuestions);
    (ApiService.post as jest.Mock).mockResolvedValue({
      character: {
        name: 'test',
        nameKo: '테스트',
        description: '테스트 캐릭터',
        traits: ['특성1'],
        imageUrl: 'https://example.com/test.png',
      },
      scores: { test: 1 },
      matchPercentage: 100,
    });
  });

  it('should only submit 10 answers', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    // Wait for questions to load
    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      // Select option A for each question
      const optionA = getByText('Option A');
      fireEvent.press(optionA);

      // Press next button
      const nextButton = getByText('다음으로');
      fireEvent.press(nextButton);

      // Wait for next question or result
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
        });
      }
    }

    // Check that API was called with exactly 10 answers
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalledWith('/personality-test/result', {
        answers: Array(10).fill('A'),
      });
    });
  });

  it('should track answer count correctly', async () => {
    const { getByText, queryByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Check initial state
    expect(getByText('1/10')).toBeTruthy();

    // Answer first question
    fireEvent.press(getByText('Option A'));
    fireEvent.press(getByText('다음으로'));

    await waitFor(() => {
      expect(getByText('2/10')).toBeTruthy();
    });

    // Continue answering
    for (let i = 2; i <= 10; i++) {
      fireEvent.press(getByText('Option B'));
      fireEvent.press(getByText('다음으로'));
      
      if (i < 10) {
        await waitFor(() => {
          expect(getByText(`${i + 1}/10`)).toBeTruthy();
        });
      }
    }

    // Verify final submission
    await waitFor(() => {
      const callArgs = (ApiService.post as jest.Mock).mock.calls[0];
      expect(callArgs[1].answers.length).toBe(10);
    });
  });
});