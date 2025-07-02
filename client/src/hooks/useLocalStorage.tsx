import { useState, useEffect } from 'react';

// Local storage hook for client-side data persistence
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Specialized hook for caching API responses with expiration
export function useLocalCache<T>(key: string, expirationMinutes: number = 30) {
  const [cachedData, setCachedData] = useLocalStorage<{
    data: T | null;
    timestamp: number;
    expires: number;
  }>(`cache_${key}`, {
    data: null,
    timestamp: 0,
    expires: 0
  });

  const isExpired = () => {
    return Date.now() > cachedData.expires;
  };

  const getCachedData = (): T | null => {
    if (cachedData.data && !isExpired()) {
      return cachedData.data;
    }
    return null;
  };

  const setCacheData = (data: T) => {
    const now = Date.now();
    setCachedData({
      data,
      timestamp: now,
      expires: now + (expirationMinutes * 60 * 1000)
    });
  };

  const clearCache = () => {
    setCachedData({
      data: null,
      timestamp: 0,
      expires: 0
    });
  };

  return {
    getCachedData,
    setCacheData,
    clearCache,
    isExpired: isExpired(),
    lastUpdated: cachedData.timestamp
  };
}

// Hook for offline data management
export function useOfflineStorage<T>(key: string) {
  const [offlineData, setOfflineData] = useLocalStorage<T[]>(`offline_${key}`, []);
  const [pendingSync, setPendingSync] = useLocalStorage<T[]>(`pending_${key}`, []);

  const addOfflineData = (data: T) => {
    setOfflineData(prev => [...prev, data]);
  };

  const addToPendingSync = (data: T) => {
    setPendingSync(prev => [...prev, data]);
  };

  const clearPendingSync = () => {
    setPendingSync([]);
  };

  const removePendingItem = (index: number) => {
    setPendingSync(prev => prev.filter((_, i) => i !== index));
  };

  return {
    offlineData,
    pendingSync,
    addOfflineData,
    addToPendingSync,
    clearPendingSync,
    removePendingItem,
    hasOfflineData: offlineData.length > 0,
    hasPendingSync: pendingSync.length > 0
  };
}