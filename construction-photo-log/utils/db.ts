import { ProjectData } from '../types';

/**
 * IndexedDB 工具模組
 * 
 * 為什麼使用 IndexedDB？
 * 1. LocalStorage 容量限制通常只有 5MB，無法儲存大量 Base64 照片。
 * 2. IndexedDB 可儲存大量結構化數據，適合本 App 的離線儲存需求。
 */

const DB_NAME = 'ConstructionAppDB'; // 資料庫名稱
const STORE_NAME = 'activeProject';  // ObjectStore 名稱
const DB_VERSION = 1;                // 資料庫版本

/**
 * 開啟資料庫連線
 */
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    // 當資料庫版本升級或初次建立時觸發
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 若 Store 不存在則建立
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * 將專案資料儲存到 DB
 * @param project 完整的專案資料物件
 */
export const saveProjectToDB = async (project: ProjectData): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // 開啟讀寫交易
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    // 使用固定的 key 'current' 儲存，因為我們一次只操作一個專案
    const request = store.put(project, 'current');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/**
 * 從 DB 讀取專案資料
 */
export const loadProjectFromDB = async (): Promise<ProjectData | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('current');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

/**
 * 清除 DB 中的專案資料 (用於退出專案時)
 */
export const clearProjectFromDB = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete('current');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};