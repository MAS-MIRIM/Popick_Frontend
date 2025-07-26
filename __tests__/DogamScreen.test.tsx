import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DogamScreen from '../screens/DogamScreen';
import CharacterAPI from '../utils/characterApi';

// Mock CharacterAPI
jest.mock('../utils/characterApi');

describe('DogamScreen', () => {
  const mockCharacters = [
    {
      id: 'char-molly',
      name: 'MOLLY',
      nameKo: '몰리',
      series: 'MOLLY Career',
      seriesKo: '몰리 캐리어',
      description: '다양한 직업을 체험하는 몰리',
      imageUrl: 'http://test.com/molly.png',
      popmartUrl: 'http://popmart.com/molly',
    },
    {
      id: 'char-labubu',
      name: 'LABUBU',
      nameKo: '라부부',
      series: 'LABUBU Have a Seat',
      seriesKo: '라부부 앉아있는 시리즈',
      description: '귀여운 이빨이 매력적인 라부부',
      imageUrl: 'http://test.com/labubu.png',
      popmartUrl: 'http://popmart.com/labubu',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (CharacterAPI.getCharacters as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    const { getByText } = render(<DogamScreen />);
    
    expect(getByText('캐릭터 정보를 불러오는 중...')).toBeTruthy();
  });

  it('should render characters after loading', async () => {
    (CharacterAPI.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);

    const { getByText, queryByText } = render(<DogamScreen />);

    await waitFor(() => {
      expect(queryByText('캐릭터 정보를 불러오는 중...')).toBeNull();
    });

    expect(getByText('캐릭터 도감')).toBeTruthy();
    expect(getByText('몰리')).toBeTruthy();
    expect(getByText('라부부')).toBeTruthy();
    expect(getByText('몰리 캐리어')).toBeTruthy();
    expect(getByText('라부부 앉아있는 시리즈')).toBeTruthy();
  });

  it('should show character detail modal when character is pressed', async () => {
    (CharacterAPI.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
    (CharacterAPI.getCharacterInfo as jest.Mock).mockResolvedValue({
      id: 'char-molly',
      name: 'MOLLY',
      nameKo: '몰리',
      series: 'MOLLY Career',
      seriesKo: '몰리 캐리어',
      description: '다양한 직업을 체험하는 몰리',
      images: ['http://test.com/molly1.png', 'http://test.com/molly2.png'],
      price: 50000,
      releaseDate: '2024-01-01',
    });

    const { getByText, queryByText } = render(<DogamScreen />);

    await waitFor(() => {
      expect(getByText('몰리')).toBeTruthy();
    });

    // Press on character
    fireEvent.press(getByText('몰리'));

    await waitFor(() => {
      expect(getByText('₩50,000')).toBeTruthy();
      expect(getByText('출시일: 2024-01-01')).toBeTruthy();
    });
  });

  it('should close modal when close button is pressed', async () => {
    (CharacterAPI.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
    (CharacterAPI.getCharacterInfo as jest.Mock).mockResolvedValue({
      id: 'char-molly',
      name: 'MOLLY',
      nameKo: '몰리',
      series: 'MOLLY Career',
      seriesKo: '몰리 캐리어',
      description: '다양한 직업을 체험하는 몰리',
      images: ['http://test.com/molly.png'],
    });

    const { getByText, queryByText } = render(<DogamScreen />);

    await waitFor(() => {
      expect(getByText('몰리')).toBeTruthy();
    });

    // Open modal
    fireEvent.press(getByText('몰리'));

    await waitFor(() => {
      expect(getByText('✕')).toBeTruthy();
    });

    // Close modal
    fireEvent.press(getByText('✕'));

    await waitFor(() => {
      expect(queryByText('✕')).toBeNull();
    });
  });

  it('should handle error when loading character info', async () => {
    (CharacterAPI.getCharacters as jest.Mock).mockResolvedValue(mockCharacters);
    (CharacterAPI.getCharacterInfo as jest.Mock).mockRejectedValue(new Error('Failed to load'));

    const { getByText } = render(<DogamScreen />);

    await waitFor(() => {
      expect(getByText('몰리')).toBeTruthy();
    });

    // Press on character
    fireEvent.press(getByText('몰리'));

    // Should still show basic info even if detailed info fails
    await waitFor(() => {
      expect(getByText('MOLLY')).toBeTruthy();
      expect(getByText('다양한 직업을 체험하는 몰리')).toBeTruthy();
    });
  });
});