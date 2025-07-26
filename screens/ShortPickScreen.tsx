import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import styled from 'styled-components/native';
import ApiService, { YouTubeVideo } from '../utils/api';

let WebView: any;
try {
  WebView = require('react-native-webview').WebView;
} catch (error) {
  console.warn('WebView not available, will use fallback');
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ShortPickScreen = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const fetchVideos = async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await ApiService.getYouTubeShorts('라부부', 'gaon', page, 5);
      
      // Check if we got videos
      if (!response.videos || response.videos.length === 0) {
        console.warn('[ShortPickScreen] No videos returned from API, using mock data');
        
        // Use mock data for development/testing
        const mockVideos: YouTubeVideo[] = [
          {
            id: '6YcNPmcHPng',
            title: '라부부 짝퉁 사면 100만원 잃을지도 .. 😭',
            thumbnail: 'https://i.ytimg.com/vi/6YcNPmcHPng/default.jpg',
            channelTitle: '싹다모아 꿀템 , 쿠팡템',
            publishedAt: '2025-07-07T09:00:17Z',
            url: 'https://www.youtube.com/watch?v=6YcNPmcHPng',
            duration: '0:24',
            viewCount: '2877357',
          },
          {
            id: '6hCj-XB5lq8',
            title: '2만원에 산 인형이 2억?! 신개념 인형 재테크ㄷㄷㄷ',
            thumbnail: 'https://i.ytimg.com/vi/6hCj-XB5lq8/default.jpg',
            channelTitle: '아이템홈',
            publishedAt: '2025-06-22T22:40:00Z',
            url: 'https://www.youtube.com/watch?v=6hCj-XB5lq8',
            duration: '0:21',
            viewCount: '866991',
          },
          {
            id: 'YD3zrwggwiw',
            title: "'라부부'를 아시나요?",
            thumbnail: 'https://i.ytimg.com/vi/YD3zrwggwiw/default.jpg',
            channelTitle: '난쟁이성현',
            publishedAt: '2025-07-14T12:01:03Z',
            url: 'https://www.youtube.com/watch?v=YD3zrwggwiw',
            duration: '1:30',
            viewCount: '691197',
          },
        ];
        
        if (page === 1) {
          setVideos(mockVideos);
          setHasMore(false);
          return;
        } else {
          setHasMore(false);
          return;
        }
      }
      
      if (isRefresh || page === 1) {
        setVideos(response.videos);
      } else {
        setVideos(prev => [...prev, ...response.videos]);
      }
      
      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Failed to fetch videos:', error);
      Alert.alert('오류', '비디오를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleRefresh = () => {
    fetchVideos(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchVideos(currentPage + 1);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentVideoIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const formatViewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    }
    return count;
  };

  const renderVideo = ({ item, index }: { item: YouTubeVideo; index: number }) => {
    const embedUrl = `https://www.youtube.com/embed/${item.id}?playsinline=1&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&autoplay=${index === currentVideoIndex ? '1' : '0'}&mute=0&loop=1&playlist=${item.id}`;

    return (
      <VideoContainer>
        {WebView ? (
          <WebView
            source={{ uri: embedUrl }}
            style={{ flex: 1, backgroundColor: '#000' }}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mixedContentMode="compatibility"
            renderLoading={() => (
              <LoadingOverlay>
                <ActivityIndicator size="large" color="#fff" />
              </LoadingOverlay>
            )}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: 300, resizeMode: 'cover' }} />
            <View style={{ position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, borderRadius: 40 }}>
              <Text style={{ color: 'white', fontSize: 40 }}>▶️</Text>
            </View>
          </View>
        )}
      </VideoContainer>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <LoadingFooter>
        <ActivityIndicator size="small" color="#fff" />
      </LoadingFooter>
    );
  };

  if (loading && videos.length === 0) {
    return (
      <LoadingContainer>
        <ActivityIndicator size="large" color="#FF4757" testID="loading-indicator" />
      </LoadingContainer>
    );
  }

  if (!loading && videos.length === 0) {
    return (
      <EmptyContainer>
        <EmptyText>표시할 비디오가 없습니다</EmptyText>
        <RefreshButton onPress={() => fetchVideos(1, true)}>
          <RefreshButtonText>새로고침</RefreshButtonText>
        </RefreshButton>
      </EmptyContainer>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        testID="flat-list"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF4757']}
            tintColor="#FF4757"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  background-color: #000;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #000;
`;

const VideoContainer = styled.View`
  width: ${screenWidth}px;
  height: ${screenHeight}px;
  position: relative;
  background-color: #000;
`;

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: #000;
`;

const LoadingFooter = styled.View`
  height: 50px;
  justify-content: center;
  align-items: center;
  background-color: #000;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #000;
  padding: 20px;
`;

const EmptyText = styled.Text`
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`;

const RefreshButton = styled.TouchableOpacity`
  background-color: #FF4757;
  padding: 14px 28px;
  border-radius: 25px;
  shadow-color: #FF4757;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const RefreshButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export default ShortPickScreen;