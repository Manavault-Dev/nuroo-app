import AsyncStorage from '@react-native-async-storage/async-storage';

export const devLog = (...args: unknown[]) => {
  if (__DEV__) {
    console.log('[Auth Debug]', ...args);
  }
};

export function safeJSONParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    devLog('❌ safeJSONParse error, returning null');
    return null;
  }
}

export async function safeGetItem(key: string): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v;
  } catch (error) {
    devLog('❌ safeGetItem error for key:', key, error);
    return null;
  }
}

export async function safeSetItem(
  key: string,
  value: string,
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    devLog('❌ safeSetItem error for key:', key, error);
    return false;
  }
}

export async function safeRemoveItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    devLog('❌ safeRemoveItem error for key:', key, error);
    return false;
  }
}

export async function clearCorruptedCache(keys: string[]): Promise<void> {
  try {
    await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
    devLog('🧹 Cleared corrupted cache keys:', keys);
  } catch (error) {
    devLog('❌ Error clearing corrupted cache:', error);
  }
}
