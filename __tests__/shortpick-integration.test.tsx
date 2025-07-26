import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ShortPickScreen from '../screens/ShortPickScreen';
import ApiService from '../utils/api';

// Mock dependencies
jest.mock('react-native-webview', () => ({
  WebView: ({ source, testID, ...props }: any) => {
    const MockWebView = 'WebView';
    return <MockWebView {...props} testID={testID || "webview"} source={source} />;
  },
}));

jest.mock('../utils/api');

describe('ShortPickScreen Integration Test', () => {
  const mockApiResponse = {
    videos: [
      {
        id: 'test-video-1',
        title: 'Test Video 1',
        thumbnail: 'https://example.com/thumb1.jpg',
        channelTitle: 'Test Channel',
        publishedAt: '2025-07-26T00:00:00Z',
        url: 'https://youtube.com/watch?v=test1',
        duration: '0:30',
        viewCount: '1000000',
      },
    ],
    hasMore: false,
    currentPage: '1',
    totalResults: 1,
    elapsedTimeMs: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiService.getYouTubeShorts as jest.Mock).mockResolvedValue(mockApiResponse);
  });

  it('should complete a full user flow', async () => {
    const { getByText, getByTestId, queryByTestId } = render(<ShortPickScreen />);

    // 1. Initial loading state
    expect(queryByTestId('loading-indicator')).toBeTruthy();

    // 2. Wait for videos to load
    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledWith('라부부', 'gaon', 1, 5);
      expect(getByText('Test Video 1')).toBeTruthy();
    });

    // 3. Verify video details are displayed
    expect(getByText('Test Channel')).toBeTruthy();
    expect(getByText('조회수 100.0만')).toBeTruthy();
    expect(getByText('0:30')).toBeTruthy();

    // 4. Verify WebView is displayed for the first video
    await waitFor(() => {
      expect(queryByTestId('webview-0')).toBeTruthy();
    });

    // 5. Check video overlay actions
    expect(getByText('좋아요')).toBeTruthy();
    expect(getByText('댓글')).toBeTruthy();
    expect(getByText('공유')).toBeTruthy();
  });

  it('should handle pagination when more videos exist', async () => {
    const firstPageResponse = {
      ...mockApiResponse,
      hasMore: true,
    };

    const secondPageResponse = {
      videos: [
        {
          id: 'test-video-2',
          title: 'Test Video 2',
          thumbnail: 'https://example.com/thumb2.jpg',
          channelTitle: 'Test Channel 2',
          publishedAt: '2025-07-26T00:00:00Z',
          url: 'https://youtube.com/watch?v=test2',
          duration: '0:45',
          viewCount: '500000',
        },
      ],
      hasMore: false,
      currentPage: '2',
      totalResults: 1,
      elapsedTimeMs: 100,
    };

    (ApiService.getYouTubeShorts as jest.Mock)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const { getByText, getByTestId } = render(<ShortPickScreen />);

    // Wait for first page to load
    await waitFor(() => {
      expect(getByText('Test Video 1')).toBeTruthy();
    });

    // Trigger pagination
    const flatList = getByTestId('flat-list');
    fireEvent(flatList, 'onEndReached');

    // Wait for second page to load
    await waitFor(() => {
      expect(ApiService.getYouTubeShorts).toHaveBeenCalledWith('라부부', 'gaon', 2, 5);
      expect(getByText('Test Video 2')).toBeTruthy();
    });

    // Verify both videos are displayed
    expect(getByText('Test Video 1')).toBeTruthy();
    expect(getByText('Test Video 2')).toBeTruthy();
  });
});