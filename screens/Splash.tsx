import React from 'react';
import styled from 'styled-components/native';
import {TouchableWithoutFeedback} from 'react-native';

type Props = {
  onFinish: () => void;
};

const Splash = ({onFinish}: Props) => {
  return (
    <TouchableWithoutFeedback onPress={onFinish} testID="splash-container">
      <Container>
        <Logo source={require('../assets/logo.png')} resizeMode="contain" />
      </Container>
    </TouchableWithoutFeedback>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

const Logo = styled.Image`
  width: 200px;
  height: 200px;
`;

export default Splash;
