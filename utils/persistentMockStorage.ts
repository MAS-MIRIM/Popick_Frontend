// Persistent Mock AsyncStorage for development
// This version uses different storage mechanisms based on the environment

class PersistentMockAsyncStorage {
  private storage: { [key: string]: string } = {};
  private storageKey = 'mockAsyncStorage';

  constructor() {
    this.loadFromPersistentStorage();
  }

  private loadFromPersistentStorage(): void {
    try {
      // Web environment - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(this.storageKey);
        if (saved) {
          this.storage = JSON.parse(saved);
          console.log('[PersistentMockStorage] Loaded data from localStorage');
        }
      }
      // Node/Jest environment - use a simple file-based approach
      else if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        // In test environment, start fresh
        this.storage = {};
      }
      // React Native development - fallback to memory
      else {
        console.log('[PersistentMockStorage] Using memory storage (data will be lost on restart)');
      }
    } catch (error) {
      console.error('[PersistentMockStorage] Failed to load:', error);
    }
  }

  private saveToPersistentStorage(): void {
    try {
      // Web environment - use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
      }
    } catch (error) {
      console.error('[PersistentMockStorage] Failed to save:', error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
    this.saveToPersistentStorage();
    console.log(`[PersistentMockStorage] Set ${key}:`, value.slice(0, 50) + '...');
  }

  async getItem(key: string): Promise<string | null> {
    const value = this.storage[key] || null;
    console.log(`[PersistentMockStorage] Get ${key}:`, value ? 'found' : 'not found');
    return value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.storage[key];
    this.saveToPersistentStorage();
    console.log(`[PersistentMockStorage] Removed ${key}`);
  }

  async clear(): Promise<void> {
    this.storage = {};
    this.saveToPersistentStorage();
    console.log('[PersistentMockStorage] Cleared all data');
  }

  // Helper method to manually persist current state
  async persist(): Promise<void> {
    this.saveToPersistentStorage();
    console.log('[PersistentMockStorage] Manually persisted data');
  }

  // Helper method to get all keys
  async getAllKeys(): Promise<string[]> {
    return Object.keys(this.storage);
  }

  // Helper method to get all data (for debugging)
  async getAllData(): Promise<{ [key: string]: string }> {
    return { ...this.storage };
  }
}

export default new PersistentMockAsyncStorage();