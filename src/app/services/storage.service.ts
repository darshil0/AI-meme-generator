import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private dbName = 'ai-meme-generator';
    private storeName = 'meme-store';
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = this.initDB();
    }

    private initDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };

            request.onsuccess = (event: any) => resolve(event.target.result);
            request.onerror = (event: any) => reject(event.target.error);
        });
    }

    async set(key: string, value: any): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = (event: any) => reject(event.target.error);
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = (event: any) => resolve(event.target.result || null);
            request.onerror = (event: any) => reject(event.target.error);
        });
    }

    async delete(key: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = (event: any) => reject(event.target.error);
        });
    }

    async clear(): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (event: any) => reject(event.target.error);
        });
    }
}
