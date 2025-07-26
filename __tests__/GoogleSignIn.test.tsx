import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import App from '../App';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({children}: any) => <>{children}</>,
  };
});

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock createNativeStackNavigator
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: any) => <>{children}</>,
    Screen: ({children, component}: any) => children ? children({navigation: {navigate: jest.fn()}, route: {}}) : null,
  }),
}));

describe('Google Sign-In', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should configure Google Sign-In on mount', () => {
    render(<App />);
    
    expect(GoogleSignin.configure).toHaveBeenCalledWith({
      webClientId: '1063504084094-nv0gq1t173h4epcn6ol3f11su9ds3vp6.apps.googleusercontent.com',
      offlineAccess: true,
    });
  });

  it('should handle Google login successfully', async () => {
    const mockUserInfo = {
      idToken: 'mock-id-token',
      user: {
        email: 'test@example.com',
        id: '123',
        name: 'Test User',
      },
    };

    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue(mockUserInfo);

    const {getByText} = render(<App />);
    
    // Simulate splash screen finishing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });

    await waitFor(() => {
      expect(getByText('구글 계정으로 시작하기')).toBeTruthy();
    });

    const googleLoginButton = getByText('구글 계정으로 시작하기');
    await act(async () => {
      fireEvent.press(googleLoginButton);
    });

    await waitFor(() => {
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  });

  it('should handle Google login error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Google Sign-In failed');

    (GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(mockError);

    const {getByText} = render(<App />);
    
    // Simulate splash screen finishing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2100));
    });

    await waitFor(() => {
      expect(getByText('구글 계정으로 시작하기')).toBeTruthy();
    });

    const googleLoginButton = getByText('구글 계정으로 시작하기');
    await act(async () => {
      fireEvent.press(googleLoginButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Google login error:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });
});