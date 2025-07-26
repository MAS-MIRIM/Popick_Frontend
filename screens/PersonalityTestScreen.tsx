import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { ImageBackground, Alert, ActivityIndicator } from 'react-native';
import ApiService from '../utils/api';

interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  charactersA: string[];
  charactersB: string[];
  charactersAKo: string[];
  charactersBKo: string[];
}

interface TestResult {
  character: {
    name: string;
    nameKo: string;
    description: string;
    traits: string[];
  };
  scores: Record<string, number>;
  matchPercentage: number;
}

type PersonalityTestScreenProps = {
  onComplete: (result: TestResult) => void;
};

const PersonalityTestScreen = ({ onComplete }: PersonalityTestScreenProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await ApiService.get('/personality-test/questions');
      setQuestions(response);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      Alert.alert('오류', '질문을 불러오는 중 문제가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) {
      Alert.alert('알림', '답변을 선택해주세요.');
      return;
    }

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // 마지막 질문인 경우 결과 제출
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: string[]) => {
    setLoading(true);
    try {
      const result = await ApiService.post('/personality-test/result', {
        answers: finalAnswers
      });
      onComplete(result);
    } catch (error: any) {
      console.error('Failed to submit answers:', error);
      Alert.alert('오류', '결과를 제출하는 중 문제가 발생했습니다.');
      setLoading(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#F63F4E" />
      </LoadingContainer>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <BackgroundImage source={require('../assets/background.png')} resizeMode="cover">
      <Container>
        <ProgressText>{currentQuestionIndex + 1}/10</ProgressText>
        
        <QuestionContainer>
          <QuestionText>{currentQuestion.question}</QuestionText>
          
          <OptionsContainer>
            <OptionButton 
              selected={selectedOption === 'A'}
              onPress={() => setSelectedOption('A')}
            >
              <OptionCircle selected={selectedOption === 'A'}>
                <OptionCircleText>O</OptionCircleText>
              </OptionCircle>
              <OptionText>{currentQuestion.optionA}</OptionText>
            </OptionButton>
            
            <OptionButton 
              selected={selectedOption === 'B'}
              onPress={() => setSelectedOption('B')}
            >
              <OptionCircle selected={selectedOption === 'B'}>
                <OptionCircleText>X</OptionCircleText>
              </OptionCircle>
              <OptionText>{currentQuestion.optionB}</OptionText>
            </OptionButton>
          </OptionsContainer>
        </QuestionContainer>
        
        <NextButton 
          onPress={handleNext}
          disabled={!selectedOption}
          active={!!selectedOption}
        >
          <NextButtonText>다음으로</NextButtonText>
        </NextButton>
      </Container>
    </BackgroundImage>
  );
};

const BackgroundImage = styled(ImageBackground)`
  flex: 1;
`;

const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: space-between;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ProgressText = styled.Text`
  font-size: 22px;
  font-weight: 600;
  color: #F63F4E;
  text-align: center;
  margin-top: 50px;
`;

const QuestionContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const QuestionText = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 60px;
`;

const OptionsContainer = styled.View`
  width: 100%;
`;

const OptionButton = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  background-color: ${props => props.selected ? '#FFF0F1' : 'white'};
  border-radius: 12px;
  border-width: 2px;
  border-color: ${props => props.selected ? '#F63F4E' : '#E5E5E5'};
`;

const OptionCircle = styled.View<{ selected: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props => props.selected ? '#F63F4E' : '#E5E5E5'};
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const OptionCircleText = styled.Text`
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const OptionText = styled.Text`
  flex: 1;
  font-size: 16px;
  color: #333;
`;

const NextButton = styled.TouchableOpacity<{ active: boolean }>`
  width: 100%;
  padding: 16px;
  background-color: ${props => props.active ? '#F63F4E' : '#A8A8A8'};
  border-radius: 8px;
  align-items: center;
  margin-bottom: 40px;
`;

const NextButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

export default PersonalityTestScreen;