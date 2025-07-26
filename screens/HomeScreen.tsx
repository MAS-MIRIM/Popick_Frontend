import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  View,
  Text,
  Image,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { FavoriteManager } from '../utils/favoriteManager';
import CharacterAPI, { Character } from '../utils/characterApi';
import AsyncStorage from '../utils/storage';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  height: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 20px;
`;

const Logo = styled.Image`
  width: 64px;
  height: 40px;
`;

const NotificationIcon = styled(TouchableOpacity)`
  padding: 8px;
`;

const IconImage = styled.Image`
  width: 24px;
  height: 24px;
  resize-mode: contain;
`;

const MainBanner = styled.View`
  height: 315px;
  margin: 0 -16px 20px -16px;
`;

const PageIndicator = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: -10px;
  margin-bottom: 20px;
`;

const Dot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.active ? '#ff4757' : '#dfe6e9'};
  margin: 0 4px;
`;

const SearchBar = styled.View`
  margin: 0 8px 20px;
  background-color: #ff4757;
  border-radius: 25px;
  flex-direction: row;
  align-items: center;
  padding: 12px 20px;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  color: #fff;
  font-size: 16px;
`;

const SearchIcon = styled.Image`
  width: 20px;
  height: 20px;
`;

const TrendingSection = styled.View`
  padding: 0 8px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8px;
`;

const TrendingList = styled.ScrollView`
  flex-direction: row;
`;

const TrendingItem = styled(TouchableOpacity)`
  margin-right: 20px;
  position: relative;
`;

const TrendingNumber = styled.Text`
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 16px;
  font-weight: bold;
  color: black;
  padding: 2px 6px;
  z-index: 1;
`;

const TrendingImage = styled.Image`
  width: 120px;
  height: 120px;
  margin-bottom: 8px;
  border-radius: 4px;
`;

const TrendingName = styled.Text`
  font-size: 10px;
  color: #636e72;
  text-align: center;
  width: 114px;
`;

const TabSection = styled.View`
  padding: 0 8px;
`;

const TabContainer = styled.ScrollView`
  flex-direction: row;
  margin-bottom: 20px;
`;

const Tab = styled(TouchableOpacity)`
  padding: 10px 20px;
  margin-right: 10px;
  background-color: ${props => props.active ? '#2d3436' : '#f0f0f0'};
  border-radius: 20px;
`;

const TabText = styled.Text`
  color: ${props => props.active ? '#fff' : '#636e72'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const ProductGrid = styled.View`
  padding: 0;
`;

const ProductCard = styled(TouchableOpacity)`
  width: 48%;
  margin-bottom: 20px;
`;

const ProductImage = styled.Image`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 15px;
  background-color: #f0f0f0;
  margin-bottom: 10px;
`;

const ProductInfo = styled.View``;

const ProductName = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: #2d3436;
  margin-bottom: 5px;
`;

const ProductSubtext = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: #636e72;
  margin-bottom: 5px;
`;

const LikeCount = styled.Text`
  font-size: 12px;
  color: #ff4757;
  margin-left: 5px;
`;

const { width: screenWidth } = Dimensions.get('window');

const CharacterShoppingApp = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<{[key: string]: number}>({});
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadFavorites();
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      // Clear cache and force refresh from backend
      await CharacterAPI.clearCache();
      const data = await CharacterAPI.getCharacters(true);
      
      if (data && data.length > 0) {
        setCharacters(data);
        
        // Initialize like counts for loaded characters
        const counts: {[key: string]: number} = {};
        data.forEach(char => {
          counts[char.id] = Math.floor(Math.random() * 20 + 5);
        });
        setLikeCounts(counts);
      } else {
        console.log('[HomeScreen] No characters loaded');
        setCharacters([]);
      }
    } catch (error) {
      console.error('[HomeScreen] Error loading characters:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favs = await FavoriteManager.getFavorites();
    setFavorites(favs);
  };

  const handleToggleFavorite = async (itemId: string) => {
    const isFavorite = await FavoriteManager.toggleFavorite(itemId);
    await loadFavorites();
    
    setLikeCounts(prev => ({
      ...prev,
      [itemId]: isFavorite ? prev[itemId] + 1 : prev[itemId] - 1
    }));
  };

  const handleCharacterPress = async (character: Character) => {
    try {
      // Get current owned characters
      const stored = await AsyncStorage.getItem('ownedCharacters');
      let ownedCharacters = stored ? JSON.parse(stored) : [];
      
      // Add character if not already owned
      if (!ownedCharacters.includes(character.id)) {
        ownedCharacters.push(character.id);
        await AsyncStorage.setItem('ownedCharacters', JSON.stringify(ownedCharacters));
        console.log('[HomeScreen] Added character to owned:', character.nameKo);
        
        // Also add to dogam
        const dogamStored = await AsyncStorage.getItem('dogamCharacters');
        let dogamCharacters = dogamStored ? JSON.parse(dogamStored) : [];
        if (!dogamCharacters.includes(character.id)) {
          dogamCharacters.push(character.id);
          await AsyncStorage.setItem('dogamCharacters', JSON.stringify(dogamCharacters));
          console.log('[HomeScreen] Added character to dogam:', character.nameKo);
        }
        
        alert(`${character.nameKo}를 소유 캐릭터에 추가했습니다!`);
      } else {
        alert(`${character.nameKo}는 이미 소유한 캐릭터입니다.`);
      }
    } catch (error) {
      console.error('[HomeScreen] Error adding owned character:', error);
    }
  };

  const handleBannerPress = (bannerId: string) => {
    if (bannerId === '1') {
      // "나와 잘 맞는 캐릭터는?" 배너 클릭 시 성격 테스트로 이동
      navigation.navigate('PersonalityTest' as never);
    }
  };

  const trendingItems = [
    { 
      id: 1, 
      rank: '1', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no1.png'), 
      url: 'https://www.popmart.co.kr/product/the-monsters-%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95-%ED%82%A4%EB%A7%81/1920/category/87/display/1/' 
    },
    { 
      id: 2, 
      rank: '2', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no2.png'), 
      url: 'https://www.popmart.co.kr/product/the-monsters-%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95-%ED%82%A4%EB%A7%81/1920/category/87/display/1/' 
    },
    { 
      id: 3, 
      rank: '3', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no3.png'), 
      url: 'https://www.popmart.co.kr/product/the-monsters-%ED%95%98%EC%9D%B4%EB%9D%BC%EC%9D%B4%ED%8A%B8-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95-%ED%82%A4%EB%A7%81/1920/category/87/display/1/' 
    },
    { 
      id: 4, 
      rank: '4', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no4.png'), 
      url: 'https://www.popmart.co.kr/product/the-monsters-%EC%88%98%EC%83%81%ED%95%9C-%ED%8E%B8%EC%9D%98%EC%A0%90-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B4%EC%96%B4%ED%8F%B0-%EB%B0%B1/1981/category/87/display/1/' 
    },
    { 
      id: 5, 
      rank: '5', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no5.png'), 
      url: 'https://www.popmart.co.kr/product/%ED%81%AC%EB%9D%BC%EC%9D%B4%EB%B2%A0%EC%9D%B4%EB%B9%84-%EC%82%AC%EB%9E%91%EC%9D%98-%EB%88%88%EB%AC%BC-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95/1803/category/206/display/1/' 
    },
    { 
      id: 6, 
      rank: '6', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no6.png'), 
      url: 'https://www.popmart.co.kr/product/the-monsters-%EC%B2%B4%ED%81%AC%EB%A9%94%EC%9D%B4%ED%8A%B8-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95-%ED%82%A4%EB%A7%81/1811/category/87/display/1/' 
    },
    { 
      id: 7, 
      rank: '7', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no7.png'), 
      url: 'https://www.popmart.co.kr/product/%EB%9D%BC%EB%B6%80%EB%B6%80-%EC%BD%94%EC%B9%B4%EC%BD%9C%EB%9D%BC-%EC%8B%9C%EB%A6%AC%EC%A6%88-%EC%9D%B8%ED%98%95-%ED%82%A4%EB%A7%81/1772/category/87/display/1/' 
    },
    { 
      id: 8, 
      rank: '8', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no8.png'), 
      url: 'https://www.popmart.com/labubu8' 
    },
    { 
      id: 9, 
      rank: '9', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no9.png'), 
      url: 'https://www.popmart.com/labubu9' 
    },
    { 
      id: 10, 
      rank: '10', 
      name: 'Pop Mart Labubu The...', 
      image: require('../assets/no10.png'), 
      url: 'https://www.popmart.com/labubu10' 
    }
  ];

  const tabs = ['ALL', 'DIMOO', 'LABUBU', 'MOLLY', 'SKULLPANDA', 'KUBO', 'CRYBABY', 'HIRONO', 'PUCKY'];

  const getFilteredProducts = () => {
    if (activeTab === 'ALL') {
      return characters;
    }
    return characters.filter(char => char.name.toUpperCase() === activeTab);
  };

  const products = getFilteredProducts();

  const renderProduct = ({ item, index }) => {
    const isFavorited = favorites.includes(item.id);
    
    return (
      <ProductCard 
        style={{ marginRight: index % 2 === 0 ? '2%' : 0 }}
        onPress={() => handleCharacterPress(item)}
      >
        <View style={{ position: 'relative' }}>
          <ProductImage source={{ uri: item.imageUrl }} />
          <TouchableOpacity
            style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 14 
            }}
            onPress={(e) => {
              e.stopPropagation();
              handleToggleFavorite(item.id);
            }}
          >
            <Image 
              source={isFavorited ? require('../assets/heart1.png') : require('../assets/heart2.png')} 
              style={{ width: 16, height: 16 }}
            />
            <LikeCount style={{ color: '#8C8C8C', marginLeft: 2 }}>{likeCounts[item.id] || 0}k</LikeCount>
          </TouchableOpacity>
        </View>
        <ProductInfo>
          <ProductName>{item.nameKo}</ProductName>
          <ProductSubtext>{item.seriesKo}</ProductSubtext>
          <ProductSubtext>{item.description}</ProductSubtext>
        </ProductInfo>
      </ProductCard>
    );
  };

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      
      <Header>
        <Logo source={require('../assets/logo.png')} />
        <NotificationIcon>
          <IconImage source={require('../assets/jong.png')} />
        </NotificationIcon>
      </Header>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListHeaderComponent={() => (
          <>
            <MainBanner>
              <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={[
                  { id: '1', image: require('../assets/ad1.png'), title: '나와 잘 맞는\n캐릭터는?' },
                  { id: '2', image: require('../assets/ad2.png'), title: '리사도 이제\n크라이베이비' }
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={{ width: screenWidth - 32, alignItems: 'center', justifyContent: 'center', padding: 10 }}
                    onPress={() => handleBannerPress(item.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <Image 
                        source={item.image} 
                        style={{ width: 348, height: 306, borderRadius: 12 }} 
                      />
                      <Text style={{
                        position: 'absolute',
                        bottom: 30,
                        left: 30,
                      color: 'white',
                      fontSize: 24,
                      fontWeight: 'bold',
                      textShadowColor: 'rgba(0, 0, 0, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4
                    }}>
                      {item.title}
                    </Text>
                    </View>
                  </TouchableOpacity>
                )}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / (screenWidth - 32));
                  setCurrentBannerIndex(index);
                }}
                scrollEventThrottle={16}
              />
            </MainBanner>
            
            <PageIndicator>
              <Dot active={currentBannerIndex === 0} />
              <Dot active={currentBannerIndex === 1} />
            </PageIndicator>

            <SearchBar>
              <SearchInput 
                placeholder="검색"
                placeholderTextColor="#fff"
              />
              <SearchIcon source={require('../assets/search.png')} />
            </SearchBar>

            <TrendingSection>
              <SectionTitle>지금 뜨는 캐릭터</SectionTitle>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#F63F4E', marginRight: 6 }} />
                <Text style={{ fontSize: 10, fontWeight: '500', color: '#636e72' }}>오늘 0시 기준</Text>
              </View>
              <TrendingList horizontal showsHorizontalScrollIndicator={false}>
                {trendingItems.map((item) => (
                  <TrendingItem key={item.id} onPress={() => Linking.openURL(item.url)}>
                    <View>
                      <TrendingImage source={item.image} />
                      <TrendingNumber>{item.rank}</TrendingNumber>
                    </View>
                    <TrendingName>{item.name}</TrendingName>
                  </TrendingItem>
                ))}
              </TrendingList>
            </TrendingSection>

            <TabSection>
              <TabContainer horizontal showsHorizontalScrollIndicator={false}>
                {tabs.map((tab) => (
                  <Tab 
                    key={tab} 
                    active={activeTab === tab}
                    onPress={() => setActiveTab(tab)}
                  >
                    <TabText active={activeTab === tab}>{tab}</TabText>
                  </Tab>
                ))}
              </TabContainer>
            </TabSection>
            
            {loading && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ef4444" />
                <Text style={{ marginTop: 10, color: '#636e72' }}>캐릭터 로딩 중...</Text>
              </View>
            )}
          </>
        )}
      />
    </Container>
  );
};

export default CharacterShoppingApp;