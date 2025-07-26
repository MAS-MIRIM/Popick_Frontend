import React from 'react';
import styled from 'styled-components/native';

const HomeScreen = () => {
  return (
    <Container>
      <Text>홈 화면입니다!</Text>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Text = styled.Text`
  font-size: 24px;
  font-weight: bold;
`;

export default HomeScreen;
