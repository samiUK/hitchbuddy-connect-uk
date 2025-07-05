import { useState, useEffect } from 'react';
import { ClientStorage } from '../utils/clientStorage';

interface UseCachedDataOptions {
  cacheKey: string;
  fetchFn: () => Promise<any>;
  cacheDuration?: number;
  enableOffline?: boolean;
}

export const useCachedData = ({
  cacheKey,
  fetchFn,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
  enableOffline = true
}: UseCachedDataOptions) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    loadData();
  }, [cacheKey]);

  const loadData = async () => {
    try {
      // Try cache first
      const cachedData = ClientStorage.getCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setFromCache(true);
        setLoading(false);
        
        // Refresh in background if online
        if (navigator.onLine) {
          refreshData(false);
        }
        return;
      }

      // Fetch fresh data
      await refreshData(true);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const refreshData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const freshData = await fetchFn();
      setData(freshData);
      setFromCache(false);
      
      // Cache the fresh data
      ClientStorage.setCache(cacheKey, freshData, cacheDuration);
      
      if (showLoading) setLoading(false);
    } catch (err) {
      setError(err);
      
      // If offline and we have cached data, keep using it
      if (!navigator.onLine && data && enableOffline) {
        setError(null);
      }
      
      if (showLoading) setLoading(false);
    }
  };

  const clearCache = () => {
    ClientStorage.clearCache(cacheKey);
    loadData();
  };

  return {
    data,
    loading,
    error,
    fromCache,
    refresh: () => refreshData(true),
    clearCache
  };
};

// Specialized hooks for different data types
export const useCachedRides = () => {
  return useCachedData({
    cacheKey: 'rides_list',
    fetchFn: async () => {
      const response = await fetch('/api/rides');
      if (!response.ok) throw new Error('Failed to fetch rides');
      return response.json();
    },
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  });
};

export const useCachedRideRequests = () => {
  return useCachedData({
    cacheKey: 'ride_requests_list',
    fetchFn: async () => {
      const response = await fetch('/api/ride-requests');
      if (!response.ok) throw new Error('Failed to fetch ride requests');
      return response.json();
    },
    cacheDuration: 3 * 60 * 1000 // 3 minutes
  });
};

export const useCachedBookings = () => {
  return useCachedData({
    cacheKey: 'bookings_list',
    fetchFn: async () => {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    cacheDuration: 10 * 60 * 1000 // 10 minutes
  });
};

export const useCachedNotifications = () => {
  return useCachedData({
    cacheKey: 'notifications_list',
    fetchFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    cacheDuration: 2 * 60 * 1000 // 2 minutes
  });
};