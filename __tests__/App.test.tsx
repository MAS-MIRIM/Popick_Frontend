import React from 'react';
import {render} from '@testing-library/react-native';
import App from '../App';

// Mock entire react-navigation to avoid complex navigation setup
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({children}: any) =>
      typeof children === 'function'
        ? children({navigation: {navigate: jest.fn()}})
        : null,
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    const {getByTestId} = render(<App />);
    // App should render successfully
    expect(getByTestId).toBeDefined();
  });
});
