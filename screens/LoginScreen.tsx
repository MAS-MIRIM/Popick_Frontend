import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Alert} from 'react-native';
import ApiService from '../utils/api';

type LoginScreenProps = {
  onLoginSuccess: () => void;
  onSignUpPress: () => void;
};

const LoginScreen = ({onLoginSuccess, onSignUpPress}: LoginScreenProps) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isFormValid = () => {
    return userId.trim().length > 0 && password.trim().length > 0;
  };

  const handleLogin = async () => {
    if (!userId.trim()) {
      setIdError('아이디를 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      const response = await ApiService.login(userId, password);
      Alert.alert('로그인 성공', `${response.user.nickname}님 환영합니다!`);
      onLoginSuccess();
    } catch (error: any) {
      if (error.statusCode === 401) {
        Alert.alert('로그인 실패', '아이디 또는 비밀번호가 잘못되었습니다.');
      } else {
        Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
      }
    }
  };

  const handleIdChange = (text: string) => {
    setUserId(text);
    setIdError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
  };

  return (
    <Container>
      <Spacer />
      
      <ContentContainer>
        <StepTitle>오픽에서 사용했던{'\n'}정보를 입력해주세요.</StepTitle>
        
        <InputContainer>
          <InputWrapper hasError={!!idError}>
            <StyledInput
              value={userId}
              onChangeText={handleIdChange}
              placeholder="아이디를 입력해주세요."
              placeholderTextColor="#A7A7A7"
            />
          </InputWrapper>
          {idError && (
            <ErrorContainer>
              <ErrorIcon source={require('../assets/error.png')} />
              <ErrorText>{idError}</ErrorText>
            </ErrorContainer>
          )}
        </InputContainer>

        <InputContainer>
          <InputWrapper hasError={!!passwordError}>
            <StyledInput
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="비밀번호를 입력해주세요."
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <EyeButton onPress={() => setShowPassword(!showPassword)}>
              <EyeIcon source={require('../assets/eyes.png')} />
            </EyeButton>
          </InputWrapper>
          {passwordError && (
            <ErrorContainer>
              <ErrorIcon source={require('../assets/error.png')} />
              <ErrorText>{passwordError}</ErrorText>
            </ErrorContainer>
          )}
        </InputContainer>
      </ContentContainer>

      <ButtonContainer>
        <NextButton 
          isActive={isFormValid()}
          onPress={handleLogin}
          disabled={!isFormValid()}
        >
          <NextButtonText>로그인</NextButtonText>
        </NextButton>
        
        <SignUpContainer>
          <SignUpText>아직 계정이 없으신가요? </SignUpText>
          <SignUpLink onPress={onSignUpPress}>
            <SignUpLinkText>회원가입</SignUpLinkText>
          </SignUpLink>
        </SignUpContainer>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
`;


const Spacer = styled.View`
  height: 15%;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: 28px;
`;

const StepTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  line-height: 32px;
`;

const InputContainer = styled.View`
  margin-bottom: 12px;
`;

const InputWrapper = styled.View<{hasError?: boolean}>`
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => (props.hasError ? '#FF4444' : '#E8E8E8')};
  border-radius: 8px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  padding: 15px;
  font-size: 16px;
`;

const EyeButton = styled.TouchableOpacity`
  padding: 10px;
`;

const EyeIcon = styled.Image`
  width: 20px;
  height: 13.64px;
`;

const ErrorContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  margin-left: 4px;
`;

const ErrorIcon = styled.Image`
  width: 14px;
  height: 14px;
  margin-right: 6px;
`;

const ErrorText = styled.Text`
  color: #ff4444;
  font-size: 14px;
`;

const NextButton = styled.TouchableOpacity<{isActive: boolean}>`
  width: 90%;
  padding: 15px;
  background-color: ${props => (props.isActive ? '#F63F4E' : '#A8A8A8')};
  border-radius: 8px;
  align-items: center;
  align-self: center;
  margin-vertical: 8px;
`;

const NextButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

const SignUpContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const SignUpText = styled.Text`
  font-size: 14px;
  color: #666;
`;

const SignUpLink = styled.TouchableOpacity``;

const SignUpLinkText = styled.Text`
  font-size: 14px;
  color: #F63F4E;
  font-weight: 600;
  text-decoration-line: underline;
`;

const ButtonContainer = styled.View`
  margin-top: auto;
  width: 100%;
`;

export default LoginScreen;