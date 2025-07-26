import React from 'react';
import {render} from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const {getByText} = render(<HomeScreen />);

    expect(getByText('홈 화면입니다!')).toBeTruthy();
  });
});
