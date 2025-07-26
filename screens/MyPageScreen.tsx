import React from 'react';
import styled from 'styled-components/native';

const MyPageScreen = () => {
  return (
    <Container>
      <Title>마이페이지</Title>
      <SubText>마이페이지 화면입니다</SubText>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: white;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const SubText = styled.Text`
  font-size: 16px;
  color: #666;
`;

export default MyPageScreen;