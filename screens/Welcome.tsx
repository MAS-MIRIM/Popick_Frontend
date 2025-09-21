import React from 'react';
import styled from 'styled-components/native';

type Props = {
  onLoginPress: () => void;
  onSignUpPress: () => void;
};

const Welcome = ({onLoginPress, onSignUpPress}: Props) => {
  return (
    <Container>
      <LogoContainer>
        <Logo source={require('../assets/logo.png')} resizeMode="contain" />
      </LogoContainer>
      <ButtonContainer>
        <Button onPress={onSignUpPress}>
          <ButtonText>시작하기</ButtonText>
        </Button>
        <LoginContainer>
          <LoginText>만약 계정이 있다면? </LoginText>
          <LoginLink onPress={onLoginPress}>
            <LoginLinkText>로그인하기</LoginLinkText>
          </LoginLink>
        </LoginContainer>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: white;
`;

const LogoContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.Image`
  width: 200px;
  height: 200px;
`;

const Button = styled.TouchableOpacity`
  width: 100%;
  background-color: #f63f4e;
  padding: 15px;
  border-radius: 8px;
  margin-vertical: 8px;
  align-self: center;
`;

const ButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: 18px;
  text-align: center;
`;

const ButtonContainer = styled.View`
  margin-top: auto;
  width: 100%;
  align-items: center;
`;

const LoginContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const LoginText = styled.Text`
  font-size: 14px;
  color: #666;
`;

const LoginLink = styled.TouchableOpacity``;

const LoginLinkText = styled.Text`
  font-size: 14px;
  color: #f63f4e;
  font-weight: 600;
  text-decoration-line: underline;
`;

export default Welcome;
