import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Linking } from 'react-native';
import ApiService, { User } from '../utils/api';
import AsyncStorage from '../utils/storage';
import { toysData } from '../utils/toysData';
import { FavoriteManager } from '../utils/favoriteManager';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  background-color: #F1F1F1;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 36px;
`;

const HeaderTitle = styled.Text`
  font-size: 22px;
  font-weight: 900;
`;

const HeaderSpacer = styled.View`
  width: 24px;
`;

const ProfileSection = styled.View`
  padding: 20px 36px 24px 36px;
  background-color: #F1F1F1;
`;

const ContentSection = styled.View`
  flex: 1;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const ProfileInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ProfileImageContainer = styled.View`
  position: relative;
`;

const ProfileImage = styled.View`
  width: 80px;
  height: 80px;
  background-color: #e5e7eb;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const ProfileIcon = styled.View`
  position: relative;
  width: 60px;
  height: 60px;
  align-items: center;
`;

const ProfileHead = styled.View`
  width: 24px;
  height: 24px;
  background-color: #9ca3af;
  border-radius: 12px;
  position: absolute;
  top: 0;
`;

const ProfileBody = styled.View`
  width: 40px;
  height: 30px;
  background-color: #9ca3af;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  position: absolute;
  bottom: 0;
`;

const ProfileDetails = styled.View`
  margin-left: 16px;
  flex: 1;
`;

const ProfileName = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ProfileRole = styled.Text`
  color: #6b7280;
  font-size: 14px;
`;

const UserNickname = styled.Text`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const TestResultCharacter = styled.Text`
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
`;

const StatsContainer = styled.View`
  flex-direction: row;
  margin-top: 24px;
  gap: 12px;
`;

const StatButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px 0;
  border-width: 2px;
  border-color: ${props => props.active ? '#ef4444' : '#e5e7eb'};
  border-radius: 999px;
  background-color: ${props => props.active ? 'white' : '#f3f4f6'};
`;

const StatText = styled.Text`
  text-align: center;
  color: ${props => props.active ? '#ef4444' : '#6b7280'};
  font-weight: 600;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 12px 0;
  padding-top: 24px;
`;

const ItemCard = styled.View`
  background-color: white;
  margin: 0 16px 12px 16px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
  flex-direction: row;
`;


const ItemIcon = styled.Image`
  width: 148px;
  height: 148px;
  margin-right: 16px;
  border-radius: 12px;
`;

const ItemContent = styled.View`
  flex: 1;
  justify-content: center;
`;

const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ItemDescription = styled.Text`
  color: #6b7280;
  font-size: 14px;
  line-height: 20px;
`;

const ItemFooter = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
`;

const ActionButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
`;

const ActionIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

const LinkIcon = styled.Image`
  width: 20px;
  height: 20px;
`;

const AddButton = styled.TouchableOpacity`
  background-color: #ff4757;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 20px;
  right: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 5;
`;

const AddButtonText = styled.Text`
  color: white;
  font-size: 28px;
  font-weight: 300;
`;

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'owned'>('favorites');
  const [user, setUser] = useState<User | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [favoriteToyIds, setFavoriteToyIds] = useState<string[]>([]);
  const [ownedToyIds] = useState<string[]>(['molly-castle', 'dimoo-world', 'bearbrick-400', 'molang-sweet']);
  const navigation = useNavigation();

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Reload favorites when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const favs = await FavoriteManager.getFavorites();
    setFavoriteToyIds(favs);
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // 유저 프로필 가져오기
      const profileResponse = await ApiService.getProfile();
      setUser(profileResponse.user);
      
      // 테스트 결과 가져오기 (AsyncStorage에서)
      const savedResult = await AsyncStorage.getItem('personalityTestResult');
      console.log('[MyPage] Saved result:', savedResult);
      if (savedResult) {
        const result = JSON.parse(savedResult);
        console.log('[MyPage] Parsed result:', result);
        console.log('[MyPage] Character:', result.character);
        setTestResult(result.character?.nameKo || result.character?.name || '');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F1F1', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ef4444" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F1F1' }}>
      <Container>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <Header>
          <HeaderTitle>내 프로필</HeaderTitle>
          <HeaderSpacer />
        </Header>

      <ProfileSection>
        <ProfileInfo>
          <ProfileImageContainer>
            <ProfileImage>
              <ProfileIcon>
                <ProfileHead />
                <ProfileBody />
              </ProfileIcon>
            </ProfileImage>
          </ProfileImageContainer>
          
          <ProfileDetails>
            <UserNickname>{user?.nickname || '사용자'}</UserNickname>
            <TestResultCharacter>{testResult || '테스트를 진행해주세요'}</TestResultCharacter>
          </ProfileDetails>
        </ProfileInfo>

        <StatsContainer>
          <StatButton 
            active={activeTab === 'favorites'} 
            onPress={() => setActiveTab('favorites')}
          >
            <StatText active={activeTab === 'favorites'}>찜 {favoriteToyIds.length}</StatText>
          </StatButton>
          <StatButton 
            active={activeTab === 'owned'}
            onPress={() => setActiveTab('owned')}
          >
            <StatText active={activeTab === 'owned'}>소유 캐릭터 {ownedToyIds.length}</StatText>
          </StatButton>
        </StatsContainer>
      </ProfileSection>

      <ContentSection>
        <SectionTitle>{activeTab === 'favorites' ? '찜 목록' : '소유 캐릭터'}</SectionTitle>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {activeTab === 'favorites' ? (
            <>
              {favoriteToyIds.length === 0 ? (
                <ItemCard style={{ opacity: 0.5 }}>
                  <ItemContent>
                    <ItemTitle style={{ textAlign: 'center' }}>찜한 캐릭터가 없습니다</ItemTitle>
                    <ItemDescription style={{ textAlign: 'center' }}>홈 화면에서 하트를 눌러 찜해보세요!</ItemDescription>
                  </ItemContent>
                </ItemCard>
              ) : (
                favoriteToyIds.map(toyId => {
                  const toy = toysData.find(t => t.id === toyId);
                  if (!toy) return null;
                  return (
                    <ItemCard key={toy.id}>
                      <ItemIcon source={{ uri: toy.imageUrl }} />
                      <ItemContent>
                        <ItemTitle>{toy.nameKo}</ItemTitle>
                        <ItemDescription>{toy.seriesKo}</ItemDescription>
                        <ItemDescription>{toy.description}</ItemDescription>
                        <ItemFooter>
                          <ActionButton onPress={async () => {
                            await FavoriteManager.removeFavorite(toy.id);
                            await loadFavorites();
                          }}>
                            <ActionIcon source={require('../assets/heart1.png')} />
                          </ActionButton>
                          <ActionButton onPress={() => Linking.openURL(toy.popmartUrl)}>
                            <LinkIcon source={require('../assets/link.png')} />
                          </ActionButton>
                        </ItemFooter>
                      </ItemContent>
                    </ItemCard>
                  );
                })
              )}
            </>
          ) : (
            <>
              {ownedToyIds.map(toyId => {
                const toy = toysData.find(t => t.id === toyId);
                if (!toy) return null;
                return (
                  <ItemCard key={toy.id}>
                    <ItemIcon source={{ uri: toy.imageUrl }} />
                    <ItemContent>
                      <ItemTitle>{toy.nameKo}</ItemTitle>
                      <ItemDescription>{toy.seriesKo}</ItemDescription>
                      <ItemDescription>{toy.description}</ItemDescription>
                      <ItemFooter>
                        <ActionButton onPress={() => Linking.openURL(toy.popmartUrl)}>
                          <LinkIcon source={require('../assets/link.png')} />
                        </ActionButton>
                      </ItemFooter>
                    </ItemContent>
                  </ItemCard>
                );
              })}
            </>
          )}
        </ScrollView>
      </ContentSection>
      
      {activeTab === 'owned' && (
        <AddButton onPress={() => navigation.navigate('HomeTab' as never)}>
          <AddButtonText>+</AddButtonText>
        </AddButton>
      )}
      </Container>
    </SafeAreaView>
  );
};

export default ProfileScreen;