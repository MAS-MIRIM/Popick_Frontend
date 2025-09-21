import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components/native';
import {ImageBackground, Alert, ActivityIndicator, Image} from 'react-native';
import ApiService from '../utils/api';
import AsyncStorage from '../utils/storage';
import {PersonalityTestResult} from '../utils/personalityTestData';
import PersonalityTestResultScreen from './PersonalityTestResultScreen';

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

type PersonalityTestScreenProps = {
  onComplete: (result: PersonalityTestResult) => void;
};

const PersonalityTestScreen = ({onComplete}: PersonalityTestScreenProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<PersonalityTestResult | null>(
    null,
  );
  const [showResult, setShowResult] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await ApiService.get('/personality-test/questions');
      console.log('[PersonalityTest] Loaded questions:', response.length);
      console.log(
        '[PersonalityTest] Questions:',
        response.map(q => q.id),
      );
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

    // 중복 클릭 방지 (ref로 즉시 체크)
    if (processingRef.current) {
      console.log('[PersonalityTest] Already processing (ref), ignoring click');
      return;
    }

    // 중복 클릭 방지 (state로도 체크)
    if (isProcessing) {
      console.log(
        '[PersonalityTest] Already processing (state), ignoring click',
      );
      return;
    }

    // 답변 개수 초과 방지
    if (answers.length >= 10) {
      console.error(
        '[PersonalityTest] Already have 10 answers, preventing additional submission',
      );
      return;
    }

    // 즉시 처리 중 플래그 설정
    processingRef.current = true;
    setIsProcessing(true);

    console.log('[PersonalityTest] handleNext called:');
    console.log('  - Current question index:', currentQuestionIndex);
    console.log('  - Total questions:', questions.length);
    console.log('  - Current answers:', answers);
    console.log('  - Selected option:', selectedOption);

    try {
      if (currentQuestionIndex < questions.length - 1) {
        // 다음 질문으로
        const newAnswers = [...answers, selectedOption];
        console.log(
          '[PersonalityTest] Moving to next question, new answers:',
          newAnswers,
        );
        setAnswers(newAnswers);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsProcessing(false);
        processingRef.current = false;
      } else {
        // 마지막 질문인 경우 결과 제출
        const finalAnswers = [...answers, selectedOption];
        console.log('[PersonalityTest] Final question reached');
        console.log('[PersonalityTest] Final answers:', finalAnswers);
        console.log('[PersonalityTest] Total answers:', finalAnswers.length);

        if (finalAnswers.length !== 10) {
          console.error(
            '[PersonalityTest] Invalid answer count:',
            finalAnswers.length,
          );
          console.error(
            '[PersonalityTest] Expected 10, got',
            finalAnswers.length,
          );
          Alert.alert(
            '오류',
            `답변 개수가 올바르지 않습니다. (${finalAnswers.length}개)`,
          );
          setIsProcessing(false);
          processingRef.current = false;
          return;
        }

        // 결과 제출 (isProcessing은 submitAnswers에서 해제)
        submitAnswers(finalAnswers);
      }
    } catch (error) {
      console.error('[PersonalityTest] Error in handleNext:', error);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const submitAnswers = async (finalAnswers: string[]) => {
    setLoading(true);
    try {
      const result = await ApiService.post('/personality-test/result', {
        answers: finalAnswers,
      });

      console.log('[PersonalityTest] Result from backend:', result);
      console.log(
        '[PersonalityTest] Character imageUrl:',
        result.character?.imageUrl,
      );

      // Save result to AsyncStorage
      await AsyncStorage.setItem(
        'personalityTestResult',
        JSON.stringify(result),
      );
      await AsyncStorage.setItem('hasCompletedPersonalityTest', 'true');

      setTestResult(result);
      setShowResult(true);
      setLoading(false);
      setIsProcessing(false);
      processingRef.current = false;

      // Call onComplete after showing result
      onComplete(result);
    } catch (error: any) {
      console.error('Failed to submit answers:', error);
      Alert.alert('오류', '결과를 제출하는 중 문제가 발생했습니다.');
      setLoading(false);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setTestResult(null);
  };

  if (loading || questions.length === 0) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#F63F4E" />
      </LoadingContainer>
    );
  }

  // Show result screen if test is completed
  if (showResult && testResult) {
    return (
      <PersonalityTestResultScreen
        result={testResult}
        onRetake={handleRetakeTest}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <BackgroundImage
      source={require('../assets/background.png')}
      resizeMode="cover">
      <Container>
        <ProgressText>{currentQuestionIndex + 1}/10</ProgressText>

        <QuestionContainer>
          <QuestionText>{currentQuestion.question}</QuestionText>

          <OptionsContainer>
            <OptionButton
              selected={selectedOption === 'A'}
              isO={true}
              onPress={() => setSelectedOption('A')}>
              <OptionCircle selected={selectedOption === 'A'} isO={true}>
                <OptionCircleText>O</OptionCircleText>
              </OptionCircle>
              <OptionText>{currentQuestion.optionA}</OptionText>
            </OptionButton>

            <OptionButton
              selected={selectedOption === 'B'}
              isO={false}
              onPress={() => setSelectedOption('B')}>
              <OptionCircle selected={selectedOption === 'B'} isO={false}>
                <OptionCircleText>X</OptionCircleText>
              </OptionCircle>
              <OptionText>{currentQuestion.optionB}</OptionText>
            </OptionButton>
          </OptionsContainer>

          <HelpContainer>
            <LightIcon source={require('../assets/light.png')} />
            <HelpText>가장 유사한 답변을 골라주세요.</HelpText>
          </HelpContainer>
        </QuestionContainer>

        <NextButton
          onPress={handleNext}
          disabled={!selectedOption || isProcessing}
          active={!!selectedOption && !isProcessing}>
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
  color: #f63f4e;
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
  margin-bottom: 40px;
`;

const OptionsContainer = styled.View`
  width: 100%;
`;

const OptionButton = styled.TouchableOpacity<{selected: boolean; isO: boolean}>`
  flex-direction: row;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  background-color: ${props =>
    props.selected ? (props.isO ? '#E6F4FF' : '#FFF0F1') : 'white'};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${props =>
    props.selected ? (props.isO ? '#3DC5FF' : '#F63F4E') : '#E5E5E5'};
`;

const OptionCircle = styled.View<{selected: boolean; isO: boolean}>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${props =>
    props.selected ? (props.isO ? '#3DC5FF' : '#F63F4E') : '#E5E5E5'};
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

const NextButton = styled.TouchableOpacity<{active: boolean}>`
  width: 100%;
  padding: 16px;
  background-color: ${props => (props.active ? '#F63F4E' : '#A8A8A8')};
  border-radius: 8px;
  align-items: center;
  margin-bottom: 40px;
`;

const NextButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: 600;
`;

const HelpContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
`;

const LightIcon = styled.Image`
  width: 12px;
  height: 15px;
  margin-right: 8px;
`;

const HelpText = styled.Text`
  font-size: 14px;
  color: #666;
`;

export default PersonalityTestScreen;
