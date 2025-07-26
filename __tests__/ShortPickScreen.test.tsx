import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ShortPickScreen from '../screens/ShortPickScreen';
import ApiService from '../utils/api';

// Mock the WebView component
jest.mock('react-native-webview', () => ({
  WebView: ({ source, testID, ...props }: any) => {
    const MockWebView = 'WebView';
    return <MockWebView {...props} testID={testID || "webview"} source={source} />;
  },
}));

// Mock ApiService
jest.mock('../utils/api');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockVideosResponse = {
  videos: [
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
      title: '2만원에 산 인형이 2억?! 신개념 인형 재테크ㄷㄷㄷ#라부부#라부부인형#재테크#쿠팡#쿠팡추천템#labubu',
      thumbnail: 'https://i.ytimg.com/vi/6hCj-XB5lq8/default.jpg',
      channelTitle: '아이템홈',
      publishedAt: '2025-06-22T22:40:00Z',
      url: 'https://www.youtube.com/watch?v=6hCj-XB5lq8',
      duration: '0:21',
      viewCount: '866991',
    },
  ],
  hasMore: true,
  currentPage: '1',
  totalResults: 2,
  elapsedTimeMs: 1013,
};

describe('ShortPickScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ApiService.getYouTubeShorts as jest.Mock).mockResolvedValue(mockVideosResponse);
  });

  it('renders correctly with loading state', () => {
    const { getByTestId } = render(<ShortPickScreen />);
    expect(() => getByTestId('loading-indicator')).not.toThrow();
  });

  it('fetches and displays videos on mount', async () => {
    const { getByText, queryByTestId } = render(<ShortPickScreen />);

    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledWith('라부부', 'gaon', 1, 5);
    });

    await waitFor(() => {
      expect(getByText('라부부 짝퉁 사면 100만원 잃을지도 .. 😭')).toBeTruthy();
      expect(getByText('싹다모아 꿀템 , 쿠팡템')).toBeTruthy();
      expect(getByText('조회수 287.7만')).toBeTruthy();
      expect(getByText('0:24')).toBeTruthy();
    });
  });

  it('displays videos in full-screen format with WebView', async () => {
    const { getByText, queryByTestId } = render(<ShortPickScreen />);

    await waitFor(() => {
      expect(getByText('라부부 짝퉁 사면 100만원 잃을지도 .. 😭')).toBeTruthy();
    });

    // Check that WebView is rendered for the first video
    await waitFor(() => {
      expect(queryByTestId('webview-0')).toBeTruthy();
    });

    // Check video overlay information
    const likeButtons = await waitFor(() => queryByTestId('flat-list'));
    expect(likeButtons).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    (ApiService.getYouTubeShorts as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ShortPickScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('오류', '비디오를 불러오는 중 문제가 발생했습니다.');
    });
  });

  it('loads more videos on scroll to end', async () => {
    const secondPageResponse = {
      ...mockVideosResponse,
      videos: [
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
      ],
      currentPage: '2',
      hasMore: false,
    };

    (ApiService.getYouTubeShorts as jest.Mock)
      .mockResolvedValueOnce(mockVideosResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const { getByText, getByTestId } = render(<ShortPickScreen />);

    await waitFor(() => {
      expect(getByText('라부부 짝퉁 사면 100만원 잃을지도 .. 😭')).toBeTruthy();
    });

    // Simulate scrolling to end
    const flatList = getByTestId('flat-list');
    fireEvent(flatList, 'onEndReached');

    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledWith('라부부', 'gaon', 2, 5);
      expect(getByText("'라부부'를 아시나요?")).toBeTruthy();
    });
  });

  it('refreshes videos on pull to refresh', async () => {
    const { getByTestId } = render(<ShortPickScreen />);

    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledTimes(1);
    });

    const flatList = getByTestId('flat-list');
    const { refreshControl } = flatList.props;
    
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledWith('라부부', 'gaon', 1, 5);
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledTimes(2);
    });
  });

  it('formats view count correctly', async () => {
    const { getByText } = render(<ShortPickScreen />);

    await waitFor(() => {
      expect(getByText('조회수 287.7만')).toBeTruthy();
      expect(getByText('조회수 86.7만')).toBeTruthy();
    });
  });
});