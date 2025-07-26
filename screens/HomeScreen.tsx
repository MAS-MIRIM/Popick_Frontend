import React, { useState } from 'react';
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
} from 'react-native';
import styled from 'styled-components/native';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
  padding: 16px 0;
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
  margin-bottom: 20px;
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
  margin: 0 16px 20px;
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
  padding: 0 16px;
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
  background-color: #f0f0f0;
  margin-bottom: 8px;
  border-radius: 4px;
`;

const TrendingName = styled.Text`
  font-size: 12px;
  color: #636e72;
  text-align: center;
  width: 114px;
`;

const TabSection = styled.View`
  padding: 0 16px;
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
  padding: 0 16px;
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

const LikeContainer = styled.View`
  flex-direction: row;
  align-items: center;
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

  const handleCharacterPress = (url: string) => {
    Linking.openURL(url);
  };

  const trendingItems = [
    { id: 1, rank: '1', name: 'Pop Mart Labubu The...', image: require('../assets/no1.png'), url: 'https://www.popmart.com/labubu1' },
    { id: 2, rank: '2', name: 'Pop Mart Labubu The...', image: require('../assets/no2.png'), url: 'https://www.popmart.com/labubu2' },
    { id: 3, rank: '3', name: 'Pop Mart Labubu The...', image: require('../assets/no3.png'), url: 'https://www.popmart.com/labubu3' },
    { id: 4, rank: '4', name: 'Pop Mart Labubu The...', image: require('../assets/no4.png'), url: 'https://www.popmart.com/labubu4' },
    { id: 5, rank: '5', name: 'Pop Mart Labubu The...', image: require('../assets/no5.png'), url: 'https://www.popmart.com/labubu5' },
    { id: 6, rank: '6', name: 'Pop Mart Labubu The...', image: require('../assets/no6.png'), url: 'https://www.popmart.com/labubu6' },
    { id: 7, rank: '7', name: 'Pop Mart Labubu The...', image: require('../assets/no7.png'), url: 'https://www.popmart.com/labubu7' },
    { id: 8, rank: '8', name: 'Pop Mart Labubu The...', image: require('../assets/no8.png'), url: 'https://www.popmart.com/labubu8' },
    { id: 9, rank: '9', name: 'Pop Mart Labubu The...', image: require('../assets/no9.png'), url: 'https://www.popmart.com/labubu9' },
    { id: 10, rank: '10', name: 'Pop Mart Labubu The...', image: require('../assets/no10.png'), url: 'https://www.popmart.com/labubu10' },
  ];

  const tabs = ['ALL', '디무', '라부부', '몰리', '스컬판다', '지거', '크라이베이비', '키노', '피노젤리', '푸키', '하치푸푸'];

  const products = [
    { id: 1, name: '라부부', subtitle: 'THE MONSTERS', description: '원래 곳 이기를 잘고 있는', likes: '14k', colorDot: '#ff7675' },
    { id: 2, name: '팝마트 라부부 더 몬스터즈', subtitle: '하이라이트 시리즈 종류 키링', likes: '12k', colorDot: '#74b9ff' },
    { id: 3, name: '팝마트 라부부 더 몬스터즈', subtitle: '하이라이트 시리즈 종류 키링', likes: '17k', colorDot: '#a29bfe' },
    { id: 4, name: '팝마트 라부부 더 몬스터즈', subtitle: '하이라이트 시리즈 종류 키링', likes: '11k', colorDot: '#ffeaa7' },
    { id: 5, name: '팝마트 라부부 더 몬스터즈', subtitle: '하이라이트 시리즈 종류 키링', likes: '21k', colorDot: '#636e72' },
    { id: 6, name: '팝마트 라부부 더 몬스터즈', subtitle: '라부부 테이스트 마카롱', likes: '15k', colorDot: '#e17055' },
  ];

  const renderProduct = ({ item, index }) => (
    <ProductCard style={{ marginRight: index % 2 === 0 ? '2%' : 0 }}>
      <View style={{ position: 'relative' }}>
        <ProductImage source={require('../assets/background.png')} />
        <View style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          paddingHorizontal: 8, 
          paddingVertical: 4, 
          borderRadius: 12 
        }}>
          <Text style={{ fontSize: 12 }}>❤️</Text>
          <LikeCount style={{ color: 'white', marginLeft: 4 }}>{item.likes}</LikeCount>
        </View>
        <View style={{ 
          position: 'absolute',
          bottom: 10,
          right: 10,
          width: 10, 
          height: 10, 
          borderRadius: 5, 
          backgroundColor: item.colorDot 
        }} />
      </View>
      <ProductInfo>
        <ProductName>{item.name}</ProductName>
        <ProductSubtext>{item.subtitle}</ProductSubtext>
        <ProductSubtext>{item.description}</ProductSubtext>
      </ProductInfo>
    </ProductCard>
  );

  return (
    <Container>
      <StatusBar barStyle="dark-content" />
      
      <Header>
        <Logo source={require('../assets/logo.png')} />
        <NotificationIcon>
          <IconImage source={require('../assets/jong.png')} />
        </NotificationIcon>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <View style={{ width: screenWidth - 32, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
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
              </View>
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
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#636e72' }}>오늘 18시 기준</Text>
          </View>
          <TrendingList horizontal showsHorizontalScrollIndicator={false}>
            {trendingItems.map((item) => (
              <TrendingItem key={item.id} onPress={() => handleCharacterPress(item.url)}>
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

        <ProductGrid>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
          />
        </ProductGrid>
      </ScrollView>
    </Container>
  );
};

export default CharacterShoppingApp;