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

describe('PersonalityTest Integration - Answer Count Fix', () => {
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

  it('should maintain exactly 10 answers throughout the test flow', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Track answer counts at each step
    const answerCounts: number[] = [];

    for (let i = 0; i < 10; i++) {
      expect(getByText(`${i + 1}/10`)).toBeTruthy();
      
      // Select an option
      fireEvent.press(getByText(i % 2 === 0 ? 'Option A' : 'Option B'));
      
      // Click next
      fireEvent.press(getByText('다음으로'));
      
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
        });
      }
    }

    // Verify final submission
    await waitFor(() => {
      const calls = (ApiService.post as jest.Mock).mock.calls;
      expect(calls.length).toBe(1);
      expect(calls[0][0]).toBe('/personality-test/result');
      expect(calls[0][1].answers.length).toBe(10);
    });
  });

  it('should handle edge case: rapid clicks on last question', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer first 9 questions normally
    for (let i = 0; i < 9; i++) {
      fireEvent.press(getByText('Option A'));
      fireEvent.press(getByText('다음으로'));
      
      await waitFor(() => {
        expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
      });
    }

    // On last question, select option and rapidly click
    fireEvent.press(getByText('Option A'));
    
    // Simulate rapid clicking
    const nextButton = getByText('다음으로');
    for (let i = 0; i < 10; i++) {
      fireEvent.press(nextButton);
    }

    // Should only submit once with 10 answers
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalledTimes(1);
      expect(ApiService.post).toHaveBeenCalledWith('/personality-test/result', {
        answers: Array(10).fill('A'),
      });
    });
  });

  it('should not allow proceeding past 10 questions', async () => {
    const { getByText, queryByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByText('Option A'));
      fireEvent.press(getByText('다음으로'));
      
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
        });
      }
    }

    // Wait for submission
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalled();
    });

    // Should not be able to see question 11
    expect(queryByText('Question 11?')).toBeNull();
    expect(queryByText('11/10')).toBeNull();
  });

  it('should maintain state consistency with isProcessing flag', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Start test
    fireEvent.press(getByText('Option A'));
    
    // Click next multiple times quickly
    const nextButton = getByText('다음으로');
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    // Should only advance to question 2
    await waitFor(() => {
      expect(getByText('Question 2?')).toBeTruthy();
      expect(getByText('2/10')).toBeTruthy();
    });

    // Should not have jumped to question 3 or 4
    expect(queryByText('Question 3?')).toBeNull();
    expect(queryByText('Question 4?')).toBeNull();
  });
});