import { IStorageAdapter } from './IStorageAdapter';

/**
 * Production LocalStorage Adapter
 * Implements IStorageAdapter with namespacing and error resilience.
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly prefix: string;

  constructor(prefix: string = 'personal_kanban_v1_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to get key "${key}":`, error);
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to set key "${key}":`, error);
      throw new Error(`Persistence failure: could not save key "${key}"`);
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to remove key "${key}":`, error);
    }
  }

  public async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to clear storage:', error);
    }
  }
}

// Global default storage adapter instance
export const defaultStorageAdapter = new LocalStorageAdapter();
