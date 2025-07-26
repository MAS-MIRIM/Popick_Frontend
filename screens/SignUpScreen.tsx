import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Alert} from 'react-native';
import ApiService from '../utils/api';
import AsyncStorage from '../utils/storage';

type SignUpScreenProps = {
  onSignUpSuccess: () => void;
  onLoginPress: () => void;
};

const SignUpScreen = ({onSignUpSuccess, onLoginPress}: SignUpScreenProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  const [idError, setIdError] = useState('');
  const [isIdValid, setIsIdValid] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);

  const checkIdDuplicate = () => {
    if (!userId.trim()) {
      setIdError('아이디를 입력해주세요.');
      return;
    }

    // 아이디 형식 체크만 진행 (중복확인은 회원가입 시점에)
    if (userId.length < 2) {
      setIdError('아이디는 2자 이상이어야 합니다.');
      setIsIdValid(false);
    } else {
      setIdError('');
      setIsIdValid(true);
      setIsIdChecked(true);
      Alert.alert('확인', '사용 가능한 아이디 형식입니다.');
    }
  };

  const handleIdChange = (text: string) => {
    setUserId(text);
    setIsIdChecked(false);
    setIsIdValid(false);
    setIdError('');
  };

  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (!hasMinLength) {
      return '비밀번호는 8자리 이상이어야 합니다.';
    }
    if (!hasSpecialChar) {
      return '특수문자를 포함해야 합니다.';
    }
    return '';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const error = validatePassword(text);
    setPasswordError(error);

    // 비밀번호가 일치하지 않을 때에는,
    if (passwordConfirm && text !== passwordConfirm) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordConfirmError('');
    }
  };

  const handlePasswordConfirmChange = (text: string) => {
    setPasswordConfirm(text);
    if (text && text !== password) {
      setPasswordConfirmError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordConfirmError('');
    }
  };

  const isPasswordValid = () => {
    return (
      password.length >= 8 &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password) &&
      password === passwordConfirm &&
      passwordConfirm.length > 0
    );
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!userId.trim()) {
        setIdError('아이디를 입력해주세요.');
        return;
      }
      if (!isIdChecked) {
        setIdError('아이디 중복 확인을 해주세요.');
        return;
      }
      if (isIdValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (isPasswordValid()) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (nickname.trim().length > 0) {
        try {
          const response = await ApiService.register(userId, password, nickname);
          
          // 회원가입 성공 후 자동 로그인
          await ApiService.login(userId, password);
          // 첫 회원가입 표시
          await AsyncStorage.setItem('isFirstSignUp', 'true');
          onSignUpSuccess();
        } catch (error: any) {
          if (error.statusCode === 409) {
            Alert.alert('회원가입 실패', '이미 사용중인 아이디입니다.');
            setCurrentStep(1);
            setIsIdChecked(false);
            setIsIdValid(false);
          } else if (error.statusCode === 400) {
            const message = Array.isArray(error.message) ? error.message.join('\n') : error.message;
            Alert.alert('회원가입 실패', message);
          } else {
            Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
          }
        }
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <StepTitle>오픽에서 사용하실{'\n'}아이디를 입력해주세요.</StepTitle>
            <InputContainer>
              <InputWrapper hasError={!!idError}>
                <StyledInput
                  value={userId}
                  onChangeText={handleIdChange}
                  placeholder="아이디를 입력해주세요."
                  placeholderTextColor="#A7A7A7"
                />
                <DuplicateCheckButton onPress={checkIdDuplicate}>
                  <DuplicateCheckText>중복 확인</DuplicateCheckText>
                </DuplicateCheckButton>
              </InputWrapper>
              {idError && (
                <ErrorContainer>
                  <ErrorIcon source={require('../assets/error.png')} />
                  <ErrorText>{idError}</ErrorText>
                </ErrorContainer>
              )}
            </InputContainer>
          </>
        );
      case 2:
        return (
          <>
            <StepTitle>
              오픽에서 사용하실{'\n'}비밀번호를 입력해주세요.
            </StepTitle>
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

            <InputContainer>
              <InputWrapper hasError={!!passwordConfirmError}>
                <StyledInput
                  value={passwordConfirm}
                  onChangeText={handlePasswordConfirmChange}
                  placeholder="비밀번호를 다시 한 번 입력해주세요."
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                />
              </InputWrapper>
              {passwordConfirmError && (
                <ErrorContainer>
                  <ErrorIcon source={require('../assets/error.png')} />
                  <ErrorText>{passwordConfirmError}</ErrorText>
                </ErrorContainer>
              )}
            </InputContainer>
          </>
        );
      case 3:
        return (
          <>
            <StepTitle>오픽에서 사용하실{'\n'}닉네임을 입력해주세요.</StepTitle>
            <InputContainer>
              <InputWrapper>
                <StyledInput
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="닉네임을 입력해주세요."
                  placeholderTextColor="#A7A7A7"
                  secureTextEntry={false}
                />
              </InputWrapper>
            </InputContainer>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      <ProgressBarContainer>
        <ProgressBar>
          <ProgressFill width={(currentStep / 3) * 100} />
        </ProgressBar>
      </ProgressBarContainer>

      <ContentContainer>{renderStepContent()}</ContentContainer>

      <ButtonContainer>
        <NextButton
          isActive={
            currentStep === 1
              ? isIdValid
              : currentStep === 2
              ? isPasswordValid()
              : currentStep === 3
              ? nickname.trim().length > 0
              : false
          }
          onPress={handleNext}
          disabled={
            currentStep === 1
              ? !isIdValid
              : currentStep === 2
              ? !isPasswordValid()
              : currentStep === 3
              ? nickname.trim().length === 0
              : false
          }>
          <NextButtonText>{currentStep === 3 ? '완료' : '다음으로'}</NextButtonText>
        </NextButton>
        
        <LoginContainer>
          <LoginText>이미 계정이 있으신가요? </LoginText>
          <LoginLink onPress={onLoginPress}>
            <LoginLinkText>로그인</LoginLinkText>
          </LoginLink>
        </LoginContainer>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const ProgressBarContainer = styled.View`
  align-items: center;
  margin-top: 20%;
  margin-bottom: 10%;
`;

const ProgressBar = styled.View`
  height: 6px;
  width: 344px;
  background-color: #e8e8e8;
  border-radius: 3px;
`;

const ProgressFill = styled.View<{width: number}>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #F63F4E;
  border-radius: 3px;
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

const DuplicateCheckButton = styled.TouchableOpacity`
  border: #F63F4E;
  padding: 8px 16px;
  margin-right: 8px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const DuplicateCheckText = styled.Text`
  color: #F63F4E;
  font-weight: 600;
  font-size: 13px;
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

const EyeButton = styled.TouchableOpacity`
  padding: 10px;
`;

const EyeIcon = styled.Image`
  width: 20px;
  height: 13.64px;
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

const LoginContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const LoginText = styled.Text`
  font-size: 14px;
  color: #666;
`;

const LoginLink = styled.TouchableOpacity``;

const LoginLinkText = styled.Text`
  font-size: 14px;
  color: #F63F4E;
  font-weight: 600;
  text-decoration-line: underline;
`;

const ButtonContainer = styled.View`
  margin-top: auto;
  width: 100%;
`;

export default SignUpScreen;