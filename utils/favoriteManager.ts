import AsyncStorage from './storage';

const FAVORITES_KEY = 'userFavorites';

export const FavoriteManager = {
  // 찜한 아이템 목록 가져오기
  getFavorites: async (): Promise<string[]> => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  },

  // 아이템이 찜되어 있는지 확인
  isFavorite: async (itemId: string): Promise<boolean> => {
    const favorites = await FavoriteManager.getFavorites();
    return favorites.includes(itemId);
  },

  // 찜 상태 토글
  toggleFavorite: async (itemId: string): Promise<boolean> => {
    try {
      const favorites = await FavoriteManager.getFavorites();
      let newFavorites: string[];
      let isFavorite: boolean;

      if (favorites.includes(itemId)) {
        // 이미 찜한 경우, 제거
        newFavorites = favorites.filter(id => id !== itemId);
        isFavorite = false;
      } else {
        // 찜하지 않은 경우, 추가
        newFavorites = [...favorites, itemId];
        isFavorite = true;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return isFavorite;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  },

  // 찜 추가
  addFavorite: async (itemId: string): Promise<void> => {
    try {
      const favorites = await FavoriteManager.getFavorites();
      if (!favorites.includes(itemId)) {
        const newFavorites = [...favorites, itemId];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  },

  // 찜 제거
  removeFavorite: async (itemId: string): Promise<void> => {
    try {
      const favorites = await FavoriteManager.getFavorites();
      const newFavorites = favorites.filter(id => id !== itemId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  },

  // 모든 찜 제거
  clearFavorites: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }
};