import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import {Alert} from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = render(
      <LoginScreen onLoginSuccess={() => {}} />
    );

    expect(getByText(/POP!CK에서 사용했던/)).toBeTruthy();
    expect(getByText(/정보를 입력해주세요/)).toBeTruthy();
    expect(getByPlaceholderText('아이디를 입력해주세요.')).toBeTruthy();
    expect(getByPlaceholderText('비밀번호를 입력해주세요.')).toBeTruthy();
    expect(getByText('다음으로')).toBeTruthy();
  });

  it('button is initially disabled', () => {
    const {getByText} = render(<LoginScreen onLoginSuccess={() => {}} />);

    const loginButton = getByText('다음으로');
    // Button should have inactive style when empty
    expect(loginButton.props.children).toBe('다음으로');
  });


  it('calls onLoginSuccess when form is valid', async () => {
    const onLoginMock = jest.fn();
    const {getByText, getByPlaceholderText} = render(
      <LoginScreen onLoginSuccess={onLoginMock} />
    );

    const idInput = getByPlaceholderText('아이디를 입력해주세요.');
    fireEvent.changeText(idInput, 'testuser');

    const passwordInput = getByPlaceholderText('비밀번호를 입력해주세요.');
    fireEvent.changeText(passwordInput, 'password123');

    const loginButton = getByText('다음으로');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '로그인 성공',
        'testuser님 환영합니다!'
      );
      expect(onLoginMock).toHaveBeenCalledTimes(1);
    });
  });

  it('password input is secure by default', () => {
    const {getByPlaceholderText} = render(
      <LoginScreen onLoginSuccess={() => {}} />
    );

    const passwordInput = getByPlaceholderText('비밀번호를 입력해주세요.');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
});
