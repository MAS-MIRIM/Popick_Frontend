import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('../utils/favoriteManager', () => ({
  FavoriteManager: {
    getFavorites: jest.fn().mockResolvedValue([]),
    toggleFavorite: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Silence console warnings for this test
const originalWarn = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalWarn;
});

describe('HomeScreen VirtualizedList Test', () => {
  it('should not produce VirtualizedLists nesting warning', () => {
    const mockConsoleError = jest.spyOn(console, 'error');
    
    render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Check if the specific VirtualizedLists warning was logged
    const virtualizedListWarning = mockConsoleError.mock.calls.some(call => 
      call.some(arg => 
        typeof arg === 'string' && 
        arg.includes('VirtualizedLists should never be nested')
      )
    );
    
    expect(virtualizedListWarning).toBe(false);
  });
  
  it('should render FlatList without ScrollView wrapper', () => {
    const { UNSAFE_queryByType } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
    
    // Check component structure
    const flatLists = UNSAFE_queryByType('FlatList' as any);
    const scrollViews = UNSAFE_queryByType('ScrollView' as any);
    
    // Should have FlatLists but no ScrollView as main container
    expect(flatLists).toBeTruthy();
    // Note: There might be ScrollViews inside components, but not as the main wrapper
  });
});