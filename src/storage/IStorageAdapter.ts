/**
 * Storage Adapter Interface
 * Provides an asynchronous key-value persistence interface.
 * UI and Business logic do not depend directly on LocalStorage or any specific database.
 * Swapping from LocalStorage to a CloudDatabaseAdapter (e.g., Supabase, Firestore, Cloud SQL)
 * only requires implementing this interface.
 */
export interface IStorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
