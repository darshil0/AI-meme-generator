import { Injectable } from '@angular/core';
import { get, set, del, keys, clear } from 'idb-keyval';

/**
 * StorageService handles persistent data using IndexedDB via idb-keyval.
 * Provides a larger storage quota than LocalStorage and an asynchronous API.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  /**
   * Retrieves a value from IndexedDB.
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const val = await get(key);
      return val !== undefined ? (val as T) : null;
    } catch (e) {
      console.error(`StorageService: Failed to get item "${key}"`, e);
      return null;
    }
  }

  /**
   * Saves a value to IndexedDB.
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await set(key, value);
    } catch (e) {
      console.error(`StorageService: Failed to set item "${key}"`, e);
      throw e;
    }
  }

  /**
   * Deletes an item from IndexedDB.
   */
  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
    } catch (e) {
      console.error(`StorageService: Failed to remove item "${key}"`, e);
    }
  }

  /**
   * Returns all keys in the store.
   */
  async getKeys(): Promise<string[]> {
    try {
      const allKeys = await keys();
      return allKeys as string[];
    } catch (e) {
      console.error('StorageService: Failed to get keys', e);
      return [];
    }
  }

  /**
   * Clears all items from the store.
   */
  async clearAll(): Promise<void> {
    try {
      await clear();
    } catch (e) {
      console.error('StorageService: Failed to clear storage', e);
    }
  }

  /**
   * Helper to migrate data from LocalStorage to IndexedDB if it exists.
   */
  async migrateFromLocalStorage(keysToMigrate: string[]): Promise<void> {
    for (const key of keysToMigrate) {
      const localVal = localStorage.getItem(key);
      if (localVal) {
        try {
          const parsed = JSON.parse(localVal);
          await this.setItem(key, parsed);
          localStorage.removeItem(key);
          console.log(`StorageService: Migrated "${key}" from LocalStorage to IndexedDB`);
        } catch (e) {
          console.warn(`StorageService: Failed to migrate "${key}"`, e);
        }
      }
    }
  }
}
