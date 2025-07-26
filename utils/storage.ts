// Storage selector - chooses between different storage implementations
import MockStorage from './mockStorage';
import PersistentMockStorage from './persistentMockStorage';

// 환경 변수나 설정으로 스토리지 타입 선택
const USE_PERSISTENT_STORAGE = true; // 이 값을 true로 설정하면 영속성 있는 스토리지 사용

const Storage = USE_PERSISTENT_STORAGE ? PersistentMockStorage : MockStorage;

export default Storage;