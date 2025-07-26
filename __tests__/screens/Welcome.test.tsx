import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import Welcome from '../../screens/Welcome';

describe('Welcome Screen', () => {
  it('renders correctly', () => {
    const {getByText} = render(
      <Welcome onStart={() => {}} onLogin={() => {}} />,
    );

    expect(getByText('반가워요!')).toBeTruthy();
    expect(getByText(/오픽과 함께 최고의 여정을/)).toBeTruthy();
    expect(getByText('시작하기')).toBeTruthy();
    expect(getByText('이미 계정이 있다면?')).toBeTruthy();
    expect(getByText('로그인하기')).toBeTruthy();
  });

  it('calls onStart when start button is pressed', () => {
    const onStartMock = jest.fn();
    const {getByText} = render(
      <Welcome onStart={onStartMock} onLogin={() => {}} />,
    );

    const startButton = getByText('시작하기');
    fireEvent.press(startButton);

    expect(onStartMock).toHaveBeenCalledTimes(1);
  });

  it('calls onLogin when login link is pressed', () => {
    const onLoginMock = jest.fn();
    const {getByText} = render(
      <Welcome onStart={() => {}} onLogin={onLoginMock} />,
    );

    const loginLink = getByText('로그인하기');
    fireEvent.press(loginLink);

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });
});
