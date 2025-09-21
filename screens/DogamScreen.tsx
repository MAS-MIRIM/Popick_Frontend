import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import CharacterAPI, {Character, CharacterInfo} from '../utils/characterApi';
import AsyncStorage from '../utils/storage';
import {useFocusEffect} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const DogamScreen = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterInfo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [dogamCharacterIds, setDogamCharacterIds] = useState<string[]>([]);

  useEffect(() => {
    loadCharacters();
    loadDogamCharacters();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDogamCharacters();
    }, []),
  );

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await CharacterAPI.getCharacters();
      setCharacters(data);
      console.log('[DogamScreen] Loaded characters:', data.length);
    } catch (error) {
      console.error('[DogamScreen] Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDogamCharacters = async () => {
    try {
      const stored = await AsyncStorage.getItem('dogamCharacters');
      if (stored) {
        setDogamCharacterIds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('[DogamScreen] Error loading dogam characters:', error);
    }
  };

  const handleCharacterPress = async (character: Character) => {
    try {
      setLoadingInfo(true);
      setModalVisible(true);

      // 캐릭터 상세 정보 가져오기
      const info = await CharacterAPI.getCharacterInfo(character.id);
      if (info) {
        setSelectedCharacter(info);
      } else {
        // 상세 정보가 없을 경우 기본 정보 사용
        setSelectedCharacter({
          id: character.id,
          name: character.name,
          nameKo: character.nameKo,
          series: character.series,
          seriesKo: character.seriesKo,
          description: character.description,
          images: [character.imageUrl],
        });
      }
    } catch (error) {
      console.error('[DogamScreen] Error loading character info:', error);
      // 오류 시에도 기본 정보 표시
      setSelectedCharacter({
        id: character.id,
        name: character.name,
        nameKo: character.nameKo,
        series: character.series,
        seriesKo: character.seriesKo,
        description: character.description,
        images: [character.imageUrl],
      });
    } finally {
      setLoadingInfo(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCharacter(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4444" />
        <Text style={styles.loadingText}>캐릭터 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캐릭터 도감</Text>
      </View>

      {/* 캐릭터 그리드 */}
      <View style={styles.characterGrid}>
        {characters.map(character => (
          <TouchableOpacity
            key={character.id}
            style={styles.characterItem}
            onPress={() => handleCharacterPress(character)}>
            <View
              style={[
                styles.characterCard,
                dogamCharacterIds.includes(character.id) &&
                  styles.characterCardOwned,
              ]}>
              {dogamCharacterIds.includes(character.id) && (
                <View style={styles.checkMark}>
                  <Text style={styles.checkMarkText}>✓</Text>
                </View>
              )}
              <Image
                source={{uri: character.imageUrl}}
                style={styles.characterImage}
                resizeMode="contain"
              />
              <Text style={styles.characterName}>{character.nameKo}</Text>
              <Text style={styles.characterSeries}>{character.seriesKo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 캐릭터 상세 정보 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {loadingInfo ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#FF4444" />
              </View>
            ) : selectedCharacter ? (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  pagingEnabled
                  style={styles.imageScrollView}>
                  {selectedCharacter.images.map((imageUrl, index) => (
                    <Image
                      key={index}
                      source={{uri: imageUrl}}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  ))}
                </ScrollView>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalTitle}>
                    {selectedCharacter.nameKo}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedCharacter.name}
                  </Text>
                  <Text style={styles.modalSeries}>
                    {selectedCharacter.seriesKo}
                  </Text>
                  <Text style={styles.modalDescription}>
                    {selectedCharacter.description}
                  </Text>

                  {selectedCharacter.price && (
                    <Text style={styles.modalPrice}>
                      ₩{selectedCharacter.price.toLocaleString()}
                    </Text>
                  )}

                  {selectedCharacter.releaseDate && (
                    <Text style={styles.modalReleaseDate}>
                      출시일: {selectedCharacter.releaseDate}
                    </Text>
                  )}
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 36,
    backgroundColor: '#F1F1F1',
  },
  headerTitle: {
    marginTop: 60,
    fontSize: 22,
    fontWeight: '900',
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  characterItem: {
    width: (width - 45) / 2,
    marginBottom: 15,
  },
  characterCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  characterCardOwned: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  checkMarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seriesFilter: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    maxHeight: 60,
  },
  seriesTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  seriesTabActive: {
    backgroundColor: 'white',
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  seriesTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  seriesTabTextActive: {
    color: '#ef4444',
  },
  characterImage: {
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  characterSeries: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalLoading: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  imageScrollView: {
    height: 250,
  },
  modalImage: {
    width: width,
    height: 250,
  },
  modalInfo: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  modalSeries: {
    fontSize: 16,
    color: '#FF4444',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4444',
    marginBottom: 5,
  },
  modalReleaseDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default DogamScreen;
