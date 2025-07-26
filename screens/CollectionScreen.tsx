import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  FlatList,
  Dimensions,
} from 'react-native';
import styled from 'styled-components/native';
import { toysData } from '../utils/toysData';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const Header = styled.View`
  padding: 20px;
  align-items: center;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e9ecef;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #2d3436;
`;

const HeaderSubtitle = styled.Text`
  font-size: 14px;
  color: #636e72;
  margin-top: 5px;
`;

const TabContainer = styled.View`
  flex-direction: row;
  background-color: white;
  padding: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #e9ecef;
`;

const Tab = styled(TouchableOpacity)`
  flex: 1;
  padding: 12px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${props => props.active ? '#ff4757' : 'transparent'};
`;

const TabText = styled.Text`
  color: ${props => props.active ? '#ff4757' : '#636e72'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 16px;
`;

const CollectionGrid = styled.View`
  padding: 10px;
`;

const CollectionItem = styled(TouchableOpacity)`
  width: ${(Dimensions.get('window').width - 40) / 3}px;
  margin: 5px;
  background-color: white;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  overflow: hidden;
`;

const CollectionItemImage = styled.Image`
  width: 100%;
  aspect-ratio: 1;
  background-color: #f0f0f0;
`;

const CollectionItemInfo = styled.View`
  padding: 8px;
`;

const CollectionItemName = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #2d3436;
  text-align: center;
`;

const CollectionItemSeries = styled.Text`
  font-size: 10px;
  color: #636e72;
  text-align: center;
  margin-top: 2px;
`;

const LimitedBadge = styled.View`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ff4757;
  padding: 2px 6px;
  border-radius: 8px;
`;

const LimitedText = styled.Text`
  color: white;
  font-size: 9px;
  font-weight: bold;
`;

const StatsContainer = styled.View`
  background-color: white;
  margin: 10px;
  padding: 20px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const StatsTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 15px;
`;

const StatRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StatLabel = styled.Text`
  font-size: 14px;
  color: #636e72;
`;

const StatValue = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: #2d3436;
`;

const CollectionScreen = () => {
  const [activeTab, setActiveTab] = useState('all');

  const getFilteredToys = () => {
    if (activeTab === 'all') return toysData;
    if (activeTab === 'limited') return toysData.filter(toy => toy.isLimited);
    if (activeTab === 'normal') return toysData.filter(toy => !toy.isLimited);
    return toysData;
  };

  const filteredToys = getFilteredToys();
  const totalToys = toysData.length;
  const limitedToys = toysData.filter(toy => toy.isLimited).length;
  const normalToys = totalToys - limitedToys;

  const renderItem = ({ item }) => (
    <CollectionItem onPress={() => Linking.openURL(item.popmartUrl)}>
      <View>
        <CollectionItemImage source={{ uri: item.imageUrl }} />
        {item.isLimited && (
          <LimitedBadge>
            <LimitedText>LIMITED</LimitedText>
          </LimitedBadge>
        )}
      </View>
      <CollectionItemInfo>
        <CollectionItemName>{item.nameKo}</CollectionItemName>
        <CollectionItemSeries>{item.seriesKo}</CollectionItemSeries>
      </CollectionItemInfo>
    </CollectionItem>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>캐릭터 도감</HeaderTitle>
        <HeaderSubtitle>팝마트 캐릭터 컬렉션</HeaderSubtitle>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'all'} onPress={() => setActiveTab('all')}>
          <TabText active={activeTab === 'all'}>전체</TabText>
        </Tab>
        <Tab active={activeTab === 'limited'} onPress={() => setActiveTab('limited')}>
          <TabText active={activeTab === 'limited'}>리미티드</TabText>
        </Tab>
        <Tab active={activeTab === 'normal'} onPress={() => setActiveTab('normal')}>
          <TabText active={activeTab === 'normal'}>일반</TabText>
        </Tab>
      </TabContainer>

      <ScrollView showsVerticalScrollIndicator={false}>
        <StatsContainer>
          <StatsTitle>컬렉션 통계</StatsTitle>
          <StatRow>
            <StatLabel>전체 캐릭터</StatLabel>
            <StatValue>{totalToys}개</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>리미티드 에디션</StatLabel>
            <StatValue>{limitedToys}개</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>일반 에디션</StatLabel>
            <StatValue>{normalToys}개</StatValue>
          </StatRow>
        </StatsContainer>

        <CollectionGrid>
          <FlatList
            data={filteredToys}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </CollectionGrid>
      </ScrollView>
    </Container>
  );
};

export default CollectionScreen;