import React from 'react';
import styled from 'styled-components/native';

type Props = {
  onLoginPress: () => void;
  onSignUpPress: () => void;
};

const Welcome = ({onLoginPress, onSignUpPress}: Props) => {
  return (
    <Container>
      <BigText>반가워요!</BigText>
      <SmallText>오픽과 함께 최고의 여정을 {'\n'} 만들어 보세요.</SmallText>
      <WelcomeImage
        source={require('../assets/welcome.png')}
        resizeMode="contain"
      />
      <ButtonContainer>
        <Button onPress={onSignUpPress}>
          <ButtonText>시작하기</ButtonText>
        </Button>
        <LoginContainer>
          <LoginText>만약 계정이 없다면? </LoginText>
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
`;

const BigText = styled.Text`
  margin-top: auto;
  font-size: 24px;
  margin-bottom: 24px;
  font-weight: 700;
  text-align: center;
`;

const SmallText = styled.Text`
  font-size: 18px;
  margin-bottom: 18px;
  color: #E50120;
  text-align: center;
  font-weight: 600;
`;

const WelcomeImage = styled.Image`
  width: 184px;
  height: 184px;
`;

const Button = styled.TouchableOpacity`
  width: 90%;
  background-color: #E50120;
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
  color: #E50120;
  font-weight: 600;
  text-decoration-line: underline;
`;

export default Welcome;
