import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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

describe('PersonalityTestScreen - Rapid Click Prevention', () => {
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

  it('should prevent rapid double-clicking on next button', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    // Wait for questions to load
    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Select option A
    fireEvent.press(getByText('Option A'));

    // Try to rapidly click next button multiple times
    const nextButton = getByText('다음으로');
    
    // Simulate rapid clicks
    await act(async () => {
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
    });

    // Wait for state to settle
    await waitFor(() => {
      expect(getByText('Question 2?')).toBeTruthy();
    });

    // Verify we only moved to question 2, not further
    expect(getByText('2/10')).toBeTruthy();
  });

  it('should prevent submitting more than 10 answers even with rapid clicks', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer all questions with rapid clicks on last question
    for (let i = 0; i < 10; i++) {
      // Select option
      fireEvent.press(getByText('Option A'));
      
      // On the last question, try rapid clicking
      if (i === 9) {
        const nextButton = getByText('다음으로');
        await act(async () => {
          fireEvent.press(nextButton);
          fireEvent.press(nextButton);
          fireEvent.press(nextButton);
          fireEvent.press(nextButton);
          fireEvent.press(nextButton);
        });
      } else {
        // Normal click for other questions
        fireEvent.press(getByText('다음으로'));
        
        if (i < 9) {
          await waitFor(() => {
            expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
          });
        }
      }
    }

    // Verify API was called only once with exactly 10 answers
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalledTimes(1);
      expect(ApiService.post).toHaveBeenCalledWith('/personality-test/result', {
        answers: Array(10).fill('A'),
      });
    });
  });

  it('should disable button while processing', async () => {
    const { getByText, queryByTestId } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer all 9 questions normally
    for (let i = 0; i < 9; i++) {
      fireEvent.press(getByText('Option A'));
      fireEvent.press(getByText('다음으로'));
      
      await waitFor(() => {
        expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
      });
    }

    // On the last question, make API slow
    let resolvePromise;
    (ApiService.post as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => {
        resolvePromise = resolve;
      })
    );

    // Select last option
    fireEvent.press(getByText('Option A'));
    
    // Click next
    const nextButton = getByText('다음으로');
    fireEvent.press(nextButton);

    // Try clicking again while processing
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    // Verify API was called only once
    expect(ApiService.post).toHaveBeenCalledTimes(1);

    // Resolve the promise
    act(() => {
      resolvePromise({
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
  });
});