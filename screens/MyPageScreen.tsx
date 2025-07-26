import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView, StatusBar, ScrollView } from 'react-native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f9fafb;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const BackButton = styled.TouchableOpacity`
  padding: 4px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
`;

const HeaderSpacer = styled.View`
  width: 24px;
`;

const ProfileSection = styled.View`
  background-color: white;
  padding: 24px 16px;
  margin-bottom: 8px;
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
  background-color: #d1d5db;
  border-radius: 40px;
  align-items: center;
  justify-content: center;
`;

const EditBadge = styled.View`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background-color: #ef4444;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
`;

const EditBadgeText = styled.Text`
  color: white;
  font-size: 12px;
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
  font-size: 16px;
  font-weight: 600;
  margin: 16px 16px 12px 16px;
`;

const ItemCard = styled.TouchableOpacity`
  background-color: white;
  margin: 0 16px 12px 16px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
`;

const ItemHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 8px;
`;

const ItemIcon = styled.View`
  width: 48px;
  height: 48px;
  margin-right: 12px;
`;

const ItemContent = styled.View`
  flex: 1;
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
  margin-top: 12px;
  gap: 16px;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const ActionIcon = styled.View`
  width: 20px;
  height: 20px;
`;

const BottomNavigation = styled.View`
  flex-direction: row;
  background-color: white;
  border-top-width: 1px;
  border-top-color: #e5e7eb;
  padding-top: 8px;
  padding-bottom: 20px;
`;

const NavItem = styled.TouchableOpacity`
  flex: 1;
  align-items: center;
  padding: 8px 0;
`;

const NavIcon = styled.View`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
`;

const NavText = styled.Text`
  font-size: 12px;
  color: ${props => props.active ? '#ef4444' : '#6b7280'};
`;

const ProfileScreen = () => {
  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      <Header>
        <BackButton>
          {/* 뒤로가기 아이콘 */}
        </BackButton>
        <HeaderTitle>내 프로필</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileSection>
          <ProfileInfo>
            <ProfileImageContainer>
              <ProfileImage>
                {/* 프로필 이미지 */}
              </ProfileImage>
              <EditBadge>
                <EditBadgeText>✏</EditBadgeText>
              </EditBadge>
            </ProfileImageContainer>
            
            <ProfileDetails>
              <ProfileName>김지원</ProfileName>
              <ProfileRole>팀장</ProfileRole>
            </ProfileDetails>
          </ProfileInfo>

          <StatsContainer>
            <StatButton active>
              <StatText active>찜 14</StatText>
            </StatButton>
            <StatButton>
              <StatText>소유 캐릭터 7</StatText>
            </StatButton>
          </StatsContainer>
        </ProfileSection>

        <SectionTitle>찜 목록</SectionTitle>

        <ItemCard>
          <ItemHeader>
            <ItemIcon>
              {/* 크라이베이비 아이콘 이미지 */}
            </ItemIcon>
            <ItemContent>
              <ItemTitle>크라이베이비</ItemTitle>
              <ItemDescription>멜프레시오니즘 시리즈{'\n'}플러시 봄 머쉰</ItemDescription>
            </ItemContent>
          </ItemHeader>
          <ItemFooter>
            <ActionButton>
              <ActionIcon>
                {/* 하트 아이콘 */}
              </ActionIcon>
            </ActionButton>
            <ActionButton>
              <ActionIcon>
                {/* 공유 아이콘 */}
              </ActionIcon>
            </ActionButton>
          </ItemFooter>
        </ItemCard>

        <ItemCard>
          <ItemHeader>
            <ItemIcon>
              {/* 라부부 아이콘 이미지 */}
            </ItemIcon>
            <ItemContent>
              <ItemTitle>라부부</ItemTitle>
              <ItemDescription>더 몬스터즈 하이레이트{'\n'}시리즈 사랑 커플</ItemDescription>
            </ItemContent>
          </ItemHeader>
          <ItemFooter>
            <ActionButton>
              <ActionIcon>
                {/* 하트 아이콘 */}
              </ActionIcon>
            </ActionButton>
            <ActionButton>
              <ActionIcon>
                {/* 공유 아이콘 */}
              </ActionIcon>
            </ActionButton>
          </ItemFooter>
        </ItemCard>
      </ScrollView>

      <BottomNavigation>
        <NavItem>
          <NavIcon>
            {/* 홈 아이콘 */}
          </NavIcon>
          <NavText>홈</NavText>
        </NavItem>
        <NavItem>
          <NavIcon>
            {/* 쇼핑 아이콘 */}
          </NavIcon>
          <NavText>쇼핑</NavText>
        </NavItem>
        <NavItem>
          <NavIcon>
            {/* 도감 아이콘 */}
          </NavIcon>
          <NavText>도감</NavText>
        </NavItem>
        <NavItem>
          <NavIcon>
            {/* 마이페이지 아이콘 */}
          </NavIcon>
          <NavText active>마이페이지</NavText>
        </NavItem>
      </BottomNavigation>
    </Container>
  );
};

export default ProfileScreen;