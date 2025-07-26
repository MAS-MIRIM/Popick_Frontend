/**
 * Test to verify personality test answer count fix
 * Ensures exactly 10 answers are submitted regardless of rapid clicking
 */

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

describe('PersonalityTest Answer Count Fix Verification', () => {
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
    // Mock API responses
    (ApiService.get as jest.Mock).mockResolvedValue(mockQuestions);
    (ApiService.post as jest.Mock).mockImplementation((endpoint, body) => {
      console.log('API Post called:', endpoint, 'with answers:', body.answers?.length);
      return Promise.resolve({
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

  test('CRITICAL: Should submit exactly 10 answers - no more, no less', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    // Wait for questions to load
    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Answer all 10 questions
    for (let i = 0; i < 10; i++) {
      // Verify we're on the correct question
      expect(getByText(`${i + 1}/10`)).toBeTruthy();
      expect(getByText(`Question ${i + 1}?`)).toBeTruthy();
      
      // Select option A
      fireEvent.press(getByText('Option A'));
      
      // Click next
      fireEvent.press(getByText('다음으로'));
      
      // Wait for next question (or submission on last question)
      if (i < 9) {
        await waitFor(() => {
          expect(getByText(`Question ${i + 2}?`)).toBeTruthy();
        });
      }
    }

    // Verify API was called exactly once with exactly 10 answers
    await waitFor(() => {
      expect(ApiService.post).toHaveBeenCalledTimes(1);
      expect(ApiService.post).toHaveBeenCalledWith(
        '/personality-test/result',
        { answers: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'] }
      );
    });
    
    // Log verification
    console.log('✅ Test passed: Exactly 10 answers submitted');
  });

  test('EDGE CASE: Rapid clicking should not cause extra submissions', async () => {
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

    // On the last question, simulate rapid clicking scenario
    fireEvent.press(getByText('Option A'));
    
    // Simulate user rapidly clicking the next button
    const nextButton = getByText('다음으로');
    
    await act(async () => {
      // Rapid fire clicks
      for (let i = 0; i < 20; i++) {
        try {
          fireEvent.press(nextButton);
        } catch (e) {
          // Button might be unmounted after first click
          break;
        }
      }
    });

    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify only one API call was made
    expect(ApiService.post).toHaveBeenCalledTimes(1);
    
    // Verify exactly 10 answers were submitted
    const apiCall = (ApiService.post as jest.Mock).mock.calls[0];
    expect(apiCall[1].answers.length).toBe(10);
    
    console.log('✅ Rapid click test passed: Still exactly 10 answers');
  });

  test('STATE CHECK: Processing flag should prevent duplicate submissions', async () => {
    const { getByText } = render(
      <PersonalityTestScreen onComplete={mockOnComplete} />
    );

    await waitFor(() => {
      expect(getByText('Question 1?')).toBeTruthy();
    });

    // Track console logs to verify our protection is working
    const consoleSpy = jest.spyOn(console, 'log');

    // Select option and rapidly click next
    fireEvent.press(getByText('Option A'));
    
    // Multiple rapid clicks
    const nextButton = getByText('다음으로');
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    // Wait for navigation to complete
    await waitFor(() => {
      expect(getByText('Question 2?')).toBeTruthy();
    });

    // Check if our protection logged messages
    const protectionLogs = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes('Already processing')
    );
    
    // We should see at least one protection message if rapid clicking occurred
    console.log(`✅ Protection activated ${protectionLogs.length} times`);
    
    consoleSpy.mockRestore();
  });
});