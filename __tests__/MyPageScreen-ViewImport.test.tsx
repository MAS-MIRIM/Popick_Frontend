import React from 'react';
import { render } from '@testing-library/react-native';
import MyPageScreen from '../screens/MyPageScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('../utils/api', () => ({
  getProfile: jest.fn().mockResolvedValue({ user: { nickname: 'Test User' } }),
}));

jest.mock('../utils/storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
}));

jest.mock('../utils/favoriteManager', () => ({
  FavoriteManager: {
    getFavorites: jest.fn().mockResolvedValue([]),
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

describe('MyPageScreen View Import Test', () => {
  it('should render without View import error', () => {
    const { getByText } = render(
      <NavigationContainer>
        <MyPageScreen />
      </NavigationContainer>
    );
    
    // If View is not imported properly, this test will fail with "View doesn't exist" error
    expect(getByText('내 프로필')).toBeTruthy();
  });

  it('should render the spacing View between stat buttons', async () => {
    const { UNSAFE_queryByType } = render(
      <NavigationContainer>
        <MyPageScreen />
      </NavigationContainer>
    );
    
    // Check if View components are rendered (this will fail if View is not imported)
    const viewComponents = UNSAFE_queryByType('View' as any);
    expect(viewComponents).toBeTruthy();
  });
});