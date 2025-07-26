import React, { useState } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native';
import { PersonalityTestResult, personalityTestCharacters } from '../utils/personalityTestData';
import { useNavigation } from '@react-navigation/native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  padding: 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 10px;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #636e72;
  text-align: center;
`;

const CharacterSection = styled.View`
  align-items: center;
  padding: 20px;
`;

const CharacterImage = styled.Image`
  width: 250px;
  height: 250px;
  border-radius: 20px;
  background-color: #f0f0f0;
`;

const CharacterName = styled.Text`
  margin-top: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 10px;
`;

const MatchPercentage = styled.Text`
  font-size: 48px;
  font-weight: bold;
  color: #ef4444;
  margin-bottom: 5px;
`;

const MatchText = styled.Text`
  font-size: 16px;
  color: #636e72;
  margin-bottom: 20px;
`;

const CharacterDescription = styled.Text`
  font-size: 16px;
  color: #2d3436;
  text-align: center;
  line-height: 24px;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const TraitsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 20px;
  margin-bottom: 30px;
`;

const TraitBadge = styled.View`
  background-color: #fee2e2;
  padding: 8px 16px;
  border-radius: 20px;
  margin: 5px;
`;

const TraitText = styled.Text`
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
`;

const ScoresSection = styled.View`
  padding: 20px;
`;

const ScoresTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 15px;
  text-align: center;
`;

const ScoreItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const ScoreName = styled.Text`
  font-size: 14px;
  color: #2d3436;
  width: 80px;
`;

const ScoreBarContainer = styled.View`
  flex: 1;
  height: 20px;
  background-color: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin: 0 10px;
`;

const ScoreBar = styled.View<{ width: number; isTop: boolean }>`
  height: 100%;
  background-color: ${props => props.isTop ? '#ef4444' : '#fca5a5'};
  width: ${props => props.width}%;
`;

const ScorePercentage = styled.Text`
  font-size: 12px;
  color: #636e72;
  width: 40px;
  text-align: right;
`;

const ButtonContainer = styled.View`
  padding: 20px;
  gap: 12px;
`;

const PrimaryButton = styled(TouchableOpacity)`
  background-color: #ef4444;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
`;

const SecondaryButton = styled(TouchableOpacity)`
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  border-width: 1px;
  border-color: #e5e7eb;
`;

const ButtonText = styled.Text<{ primary?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.primary ? '#fff' : '#2d3436'};
`;

interface Props {
  result: PersonalityTestResult;
  onRetake?: () => void;
}

const PersonalityTestResultScreen: React.FC<Props> = ({ result, onRetake }) => {
  const navigation = useNavigation();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const sortedScores = Object.entries(result.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const handleGoHome = () => {
    navigation.navigate('MainTabs' as never);
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
    } else {
      navigation.navigate('PersonalityTest' as never);
    }
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header>
          <Title>당신과 찰떡인 캐릭터는...</Title>
          <Subtitle>성격 테스트 결과</Subtitle>
        </Header>

        <CharacterSection>
          <View style={{ position: 'relative', width: 250, height: 250 }}>
            {imageLoading && !imageError && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: 20,
              }}>
                <ActivityIndicator size="large" color="#ef4444" />
              </View>
            )}
            {!imageError && result.character.imageUrl ? (
              <CharacterImage 
                source={{ 
                  uri: result.character.imageUrl.replace('http://', 'https://'),
                  cache: 'reload'
                }}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(e) => {
                  console.log('[PersonalityTestResult] Image load error:', e.nativeEvent.error);
                  console.log('[PersonalityTestResult] Failed URL:', result.character.imageUrl);
                  console.log('[PersonalityTestResult] Tried URL:', result.character.imageUrl.replace('http://', 'https://'));
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
            ) : (
              <CharacterImage source={require('../assets/placeholder.png')} />
            )}
          </View>
          
          <CharacterName>{result.character.nameKo}</CharacterName>
          
          <MatchPercentage>{result.matchPercentage}%</MatchPercentage>
          <MatchText>일치율</MatchText>
          
          <CharacterDescription>
            {result.character.description}
          </CharacterDescription>

          <TraitsContainer>
            {result.character.traits.map((trait, index) => (
              <TraitBadge key={index}>
                <TraitText>#{trait}</TraitText>
              </TraitBadge>
            ))}
          </TraitsContainer>
        </CharacterSection>

        <ScoresSection>
          <ScoresTitle>다른 캐릭터와의 매칭률</ScoresTitle>
          {sortedScores.map(([characterKey, score], index) => {
            const character = personalityTestCharacters[characterKey];
            return (
              <ScoreItem key={characterKey}>
                <ScoreName>{character.nameKo}</ScoreName>
                <ScoreBarContainer>
                  <ScoreBar width={score * 100} isTop={index === 0} />
                </ScoreBarContainer>
                <ScorePercentage>{Math.round(score * 100)}%</ScorePercentage>
              </ScoreItem>
            );
          })}
        </ScoresSection>

        <ButtonContainer>
          <PrimaryButton onPress={handleGoHome}>
            <ButtonText primary>홈으로 가기</ButtonText>
          </PrimaryButton>
        </ButtonContainer>
      </ScrollView>
    </Container>
  );
};

export default PersonalityTestResultScreen;