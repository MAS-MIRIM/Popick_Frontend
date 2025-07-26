// Mock AsyncStorage for development
// This is a temporary solution until iOS pods are properly installed

class MockAsyncStorage {
  private storage: { [key: string]: string } = {};

  async setItem(key: string, value: string): Promise<void> {
    this.storage[key] = value;
    console.log(`[MockStorage] Set ${key}:`, value.slice(0, 50) + '...');
  }

  async getItem(key: string): Promise<string | null> {
    const value = this.storage[key] || null;
    console.log(`[MockStorage] Get ${key}:`, value ? 'found' : 'not found');
    return value;
  }

  async removeItem(key: string): Promise<void> {
    delete this.storage[key];
    console.log(`[MockStorage] Removed ${key}`);
  }

  async clear(): Promise<void> {
    this.storage = {};
    console.log('[MockStorage] Cleared all data');
  }
}

export default new MockAsyncStorage();