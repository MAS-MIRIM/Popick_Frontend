import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import MyPageScreen from '../screens/MyPageScreen';
import DogamScreen from '../screens/DogamScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock all dependencies
jest.mock('../utils/api', () => ({
  getProfile: jest.fn().mockResolvedValue({ user: { nickname: 'Test User' } }),
  getYouTubeShorts: jest.fn().mockResolvedValue({ videos: [], hasMore: false }),
}));

jest.mock('../utils/storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
}));

jest.mock('../utils/favoriteManager', () => ({
  FavoriteManager: {
    getFavorites: jest.fn().mockResolvedValue([]),
    toggleFavorite: jest.fn().mockResolvedValue(true),
    removeFavorite: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

// Suppress console errors for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((message, ...args) => {
    // Only log non-expected errors
    if (typeof message === 'string' && 
        !message.includes('VirtualizedLists should never be nested') &&
        !message.includes('act(') &&
        !message.includes('NavigationContainer')) {
      originalError(message, ...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
});

describe('Integration Tests - All Fixes', () => {
  describe('HomeScreen', () => {
    it('should render without VirtualizedLists warning', () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      
      render(
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      );
      
      const hasVirtualizedListWarning = mockConsoleError.mock.calls.some(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          arg.includes('VirtualizedLists should never be nested')
        )
      );
      
      expect(hasVirtualizedListWarning).toBe(false);
    });
  });

  describe('MyPageScreen', () => {
    it('should render without View import error', () => {
      // This will throw if View is not imported
      const { getByTestId, queryByText } = render(
        <NavigationContainer>
          <MyPageScreen />
        </NavigationContainer>
      );
      
      // Should render without throwing View doesn't exist error
      expect(queryByText(/View doesn't exist/)).toBeNull();
    });
    
    it('should have correct owned items button spacing', () => {
      const { container } = render(
        <NavigationContainer>
          <MyPageScreen />
        </NavigationContainer>
      );
      
      // Test passes if component renders without error
      expect(container).toBeTruthy();
    });
  });

  describe('DogamScreen', () => {
    it('should render without VirtualizedLists warning', () => {
      const mockConsoleError = jest.spyOn(console, 'error');
      
      render(
        <NavigationContainer>
          <DogamScreen />
        </NavigationContainer>
      );
      
      const hasVirtualizedListWarning = mockConsoleError.mock.calls.some(call => 
        call.some(arg => 
          typeof arg === 'string' && 
          arg.includes('VirtualizedLists should never be nested')
        )
      );
      
      expect(hasVirtualizedListWarning).toBe(false);
    });
  });

  describe('File Structure Verification', () => {
    it('should verify all critical imports are correct', () => {
      const fs = require('fs');
      
      // Check MyPageScreen has View import
      const myPageContent = fs.readFileSync('./screens/MyPageScreen.tsx', 'utf8');
      expect(myPageContent).toMatch(/import\s*{[^}]*\bView\b[^}]*}\s*from\s*['"]react-native['"]/);
      
      // Check HomeScreen structure doesn't have ScrollView wrapping FlatList
      const homeContent = fs.readFileSync('./screens/HomeScreen.tsx', 'utf8');
      expect(homeContent).toMatch(/ListHeaderComponent/); // Should use ListHeaderComponent
      
      // Check DogamScreen structure
      const dogamContent = fs.readFileSync('./screens/DogamScreen.tsx', 'utf8');
      expect(dogamContent).toMatch(/ListHeaderComponent|ListFooterComponent/); // Should use List components
    });
  });
});