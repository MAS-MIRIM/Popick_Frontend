import React, { useState, useEffect } from 'react';
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
import { FavoriteManager } from '../utils/favoriteManager';
import { useFocusEffect } from '@react-navigation/native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #f8f9fa;
`;

const Header = styled.View`
  padding: 20px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e9ecef;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #2d3436;
  text-align: center;
`;

const HeaderSubtitle = styled.Text`
  font-size: 14px;
  color: #636e72;
  margin-top: 5px;
  text-align: center;
`;

const Section = styled.View`
  margin-bottom: 20px;
`;

const SectionHeader = styled.View`
  padding: 16px 20px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #e9ecef;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 4px;
`;

const SectionSubtitle = styled.Text`
  font-size: 14px;
  color: #636e72;
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

const OwnedBadge = styled.View`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #00b894;
  padding: 4px 8px;
  border-radius: 12px;
`;

const OwnedBadgeText = styled.Text`
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const ProgressContainer = styled.View`
  background-color: white;
  margin: 10px 20px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ProgressText = styled.Text`
  font-size: 14px;
  color: #636e72;
  margin-bottom: 8px;
`;

const ProgressBar = styled.View`
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: #00b894;
  border-radius: 4px;
`;

const EmptyState = styled.View`
  padding: 40px 20px;
  align-items: center;
`;

const EmptyStateText = styled.Text`
  font-size: 16px;
  color: #636e72;
  text-align: center;
`;

const SeriesCard = styled(TouchableOpacity)`
  background-color: white;
  margin: 10px 20px;
  padding: 16px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  flex-direction: row;
  align-items: center;
`;

const SeriesImage = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-right: 16px;
`;

const SeriesInfo = styled.View`
  flex: 1;
`;

const SeriesName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 4px;
`;

const SeriesDescription = styled.Text`
  font-size: 14px;
  color: #636e72;
`;

const SeriesCount = styled.Text`
  font-size: 12px;
  color: #ff4757;
  margin-top: 4px;
`;

const DogamScreen = () => {
  const [ownedToys, setOwnedToys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 예시로 소유한 캐릭터 ID들 (실제로는 AsyncStorage에서 불러와야 함)
  const defaultOwnedIds: string[] = [];

  useEffect(() => {
    loadOwnedToys();
  }, []);

  // 화면에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadOwnedToys();
    }, [])
  );

  const loadOwnedToys = async () => {
    try {
      // 실제로는 AsyncStorage에서 소유한 캐릭터 목록을 불러와야 함
      setOwnedToys(defaultOwnedIds);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load owned toys:', error);
      setLoading(false);
    }
  };

  // 시리즈별로 그룹화
  const getSeriesData = () => {
    const seriesMap = new Map();
    
    toysData.forEach(toy => {
      if (!seriesMap.has(toy.series)) {
        seriesMap.set(toy.series, {
          name: toy.series,
          nameKo: toy.seriesKo,
          toys: [],
          firstToyImage: toy.imageUrl,
        });
      }
      seriesMap.get(toy.series).toys.push(toy);
    });

    return Array.from(seriesMap.values());
  };

  // 추천 시리즈 (소유하지 않은 캐릭터가 있는 시리즈)
  const getRecommendedSeries = () => {
    const seriesData = getSeriesData();
    return seriesData.filter(series => {
      const ownedInSeries = series.toys.filter(toy => ownedToys.includes(toy.id)).length;
      return ownedInSeries < series.toys.length && ownedInSeries > 0;
    }).sort((a, b) => {
      // 완성도가 높은 순으로 정렬
      const aCompletion = a.toys.filter(toy => ownedToys.includes(toy.id)).length / a.toys.length;
      const bCompletion = b.toys.filter(toy => ownedToys.includes(toy.id)).length / b.toys.length;
      return bCompletion - aCompletion;
    });
  };

  const ownedToysData = toysData.filter(toy => ownedToys.includes(toy.id));
  const completionRate = Math.round((ownedToys.length / toysData.length) * 100);
  const recommendedSeries = getRecommendedSeries();

  const renderOwnedItem = ({ item }) => (
    <CollectionItem onPress={() => Linking.openURL(item.popmartUrl)}>
      <View>
        <CollectionItemImage source={{ uri: item.imageUrl }} />
        <OwnedBadge>
          <OwnedBadgeText>보유중</OwnedBadgeText>
        </OwnedBadge>
      </View>
      <CollectionItemInfo>
        <CollectionItemName>{item.nameKo}</CollectionItemName>
        <CollectionItemSeries>{item.seriesKo}</CollectionItemSeries>
      </CollectionItemInfo>
    </CollectionItem>
  );

  const ListHeader = () => (
    <>
      {/* 진행률 */}
      <ProgressContainer>
        <ProgressText>전체 수집률: {completionRate}% ({ownedToys.length}/{toysData.length})</ProgressText>
        <ProgressBar>
          <ProgressFill width={completionRate} />
        </ProgressBar>
      </ProgressContainer>

      {/* 내가 모은 캐릭터 */}
      <Section>
        <SectionHeader>
          <SectionTitle>내가 모은 캐릭터</SectionTitle>
          <SectionSubtitle>총 {ownedToys.length}개의 캐릭터를 모았어요!</SectionSubtitle>
        </SectionHeader>
      </Section>
    </>
  );

  const ListFooter = () => (
    <>
      {/* 추천 시리즈 */}
      {recommendedSeries.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>이 시리즈를 완성해보세요!</SectionTitle>
            <SectionSubtitle>조금만 더 모으면 시리즈를 완성할 수 있어요</SectionSubtitle>
          </SectionHeader>
          
          {recommendedSeries.map(series => {
            const ownedCount = series.toys.filter(toy => ownedToys.includes(toy.id)).length;
            return (
              <SeriesCard key={series.name}>
                <SeriesImage source={{ uri: series.firstToyImage }} />
                <SeriesInfo>
                  <SeriesName>{series.nameKo}</SeriesName>
                  <SeriesDescription>
                    {ownedCount}/{series.toys.length}개 보유중
                  </SeriesDescription>
                  <SeriesCount>
                    {series.toys.length - ownedCount}개만 더 모으면 완성!
                  </SeriesCount>
                </SeriesInfo>
              </SeriesCard>
            );
          })}
        </Section>
      )}
    </>
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>나의 도감</HeaderTitle>
        <HeaderSubtitle>내가 모은 캐릭터 컬렉션</HeaderSubtitle>
      </Header>

      {ownedToysData.length > 0 ? (
        <FlatList
          data={ownedToysData}
          renderItem={renderOwnedItem}
          keyExtractor={item => item.id}
          numColumns={3}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <ListHeader />
          <EmptyState>
            <EmptyStateText>아직 모은 캐릭터가 없어요.{'\n'}캐릭터를 모아 도감을 완성해보세요!</EmptyStateText>
          </EmptyState>
          <ListFooter />
        </ScrollView>
      )}
    </Container>
  );
};

export default DogamScreen;