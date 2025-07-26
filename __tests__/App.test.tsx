import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';
import ApiService from '../utils/api';
import AsyncStorage from '../utils/storage';

// Mock API and AsyncStorage
jest.mock('../utils/api');
jest.mock('../utils/storage');

// Mock navigation components
jest.mock('../screens/Welcome', () => 'Welcome');
jest.mock('../screens/LoginScreen', () => 'LoginScreen');
jest.mock('../screens/SignUpScreen', () => 'SignUpScreen');
jest.mock('../screens/PersonalityTestScreen', () => 'PersonalityTestScreen');
jest.mock('../navigation/TabNavigator', () => 'TabNavigator');

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading indicator initially', () => {
    (ApiService.checkAuth as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    const { getByTestId } = render(<App />);
    
    // ActivityIndicator is rendered
    expect(() => getByTestId('activity-indicator')).not.toThrow();
  });

  it('should navigate to Welcome screen when not authenticated', async () => {
    (ApiService.checkAuth as jest.Mock).mockResolvedValue(false);

    const { getByTestId } = render(<App />);

    await waitFor(() => {
      // Should render Welcome screen
      expect(() => getByTestId('welcome-screen')).not.toThrow();
    });
  });

  it('should navigate to MainTabs when authenticated and test completed', async () => {
    (ApiService.checkAuth as jest.Mock).mockResolvedValue(true);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

    const { getByTestId } = render(<App />);

    await waitFor(() => {
      // Should render TabNavigator
      expect(() => getByTestId('tab-navigator')).not.toThrow();
    });
  });

  it('should navigate to PersonalityTest when authenticated but test not completed', async () => {
    (ApiService.checkAuth as jest.Mock).mockResolvedValue(true);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(<App />);

    await waitFor(() => {
      // Should render PersonalityTestScreen
      expect(() => getByTestId('personality-test-screen')).not.toThrow();
    });
  });

  it('should handle auth check error gracefully', async () => {
    (ApiService.checkAuth as jest.Mock).mockRejectedValue(new Error('Auth check failed'));

    const { queryByTestId } = render(<App />);

    await waitFor(() => {
      // Should still render something (not crash)
      expect(queryByTestId('welcome-screen')).toBeTruthy();
    });
  });
});