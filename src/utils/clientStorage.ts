// Client-side storage utilities for reducing server load
export class ClientStorage {
  private static readonly STORAGE_KEYS = {
    USER_PROFILE: 'hitchbuddy_user_profile',
    RIDES_CACHE: 'hitchbuddy_rides_cache',
    REQUESTS_CACHE: 'hitchbuddy_requests_cache',
    BOOKINGS_CACHE: 'hitchbuddy_bookings_cache',
    MESSAGES_CACHE: 'hitchbuddy_messages_cache',
    LOCATIONS_CACHE: 'hitchbuddy_locations_cache',
    SEARCH_HISTORY: 'hitchbuddy_search_history',
    OFFLINE_QUEUE: 'hitchbuddy_offline_queue',
    LAST_SYNC: 'hitchbuddy_last_sync'
  };

  private static readonly CACHE_EXPIRY = {
    RIDES: 5 * 60 * 1000, // 5 minutes
    REQUESTS: 3 * 60 * 1000, // 3 minutes
    BOOKINGS: 10 * 60 * 1000, // 10 minutes
    MESSAGES: 1 * 60 * 1000, // 1 minute
    LOCATIONS: 60 * 60 * 1000, // 1 hour
    USER_PROFILE: 30 * 60 * 1000 // 30 minutes
  };

  // Generic cache methods
  static setCache<T>(key: string, data: T, expiryMs: number = 5 * 60 * 1000): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + expiryMs
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  static getCache<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem = JSON.parse(item);
      if (Date.now() > cacheItem.expires) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  static clearCache(key: string): void {
    localStorage.removeItem(key);
  }

  // User profile caching
  static cacheUserProfile(profile: any): void {
    this.setCache(this.STORAGE_KEYS.USER_PROFILE, profile, this.CACHE_EXPIRY.USER_PROFILE);
  }

  static getCachedUserProfile(): any {
    return this.getCache(this.STORAGE_KEYS.USER_PROFILE);
  }

  // Rides caching
  static cacheRides(rides: any[]): void {
    this.setCache(this.STORAGE_KEYS.RIDES_CACHE, rides, this.CACHE_EXPIRY.RIDES);
  }

  static getCachedRides(): any[] | null {
    return this.getCache(this.STORAGE_KEYS.RIDES_CACHE);
  }

  // Ride requests caching
  static cacheRideRequests(requests: any[]): void {
    this.setCache(this.STORAGE_KEYS.REQUESTS_CACHE, requests, this.CACHE_EXPIRY.REQUESTS);
  }

  static getCachedRideRequests(): any[] | null {
    return this.getCache(this.STORAGE_KEYS.REQUESTS_CACHE);
  }

  // Bookings caching
  static cacheBookings(bookings: any[]): void {
    this.setCache(this.STORAGE_KEYS.BOOKINGS_CACHE, bookings, this.CACHE_EXPIRY.BOOKINGS);
  }

  static getCachedBookings(): any[] | null {
    return this.getCache(this.STORAGE_KEYS.BOOKINGS_CACHE);
  }

  // Messages caching
  static cacheMessages(bookingId: string, messages: any[]): void {
    const key = `${this.STORAGE_KEYS.MESSAGES_CACHE}_${bookingId}`;
    this.setCache(key, messages, this.CACHE_EXPIRY.MESSAGES);
  }

  static getCachedMessages(bookingId: string): any[] | null {
    const key = `${this.STORAGE_KEYS.MESSAGES_CACHE}_${bookingId}`;
    return this.getCache(key);
  }

  // Location search caching
  static cacheLocationSearch(query: string, results: any[]): void {
    const searchCache = this.getCache(this.STORAGE_KEYS.LOCATIONS_CACHE) || {};
    searchCache[query.toLowerCase()] = {
      results,
      timestamp: Date.now()
    };
    this.setCache(this.STORAGE_KEYS.LOCATIONS_CACHE, searchCache, this.CACHE_EXPIRY.LOCATIONS);
  }

  static getCachedLocationSearch(query: string): any[] | null {
    const searchCache = this.getCache(this.STORAGE_KEYS.LOCATIONS_CACHE) || {};
    const cached = searchCache[query.toLowerCase()];
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_EXPIRY.LOCATIONS) {
      return cached.results;
    }
    return null;
  }

  // Search history
  static addToSearchHistory(fromLocation: string, toLocation: string): void {
    try {
      const history = this.getSearchHistory();
      const newEntry = {
        fromLocation,
        toLocation,
        timestamp: Date.now()
      };
      
      // Avoid duplicates
      const exists = history.some(h => 
        h.fromLocation === fromLocation && h.toLocation === toLocation
      );
      
      if (!exists) {
        history.unshift(newEntry);
        // Keep only last 10 searches
        const limitedHistory = history.slice(0, 10);
        localStorage.setItem(this.STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limitedHistory));
      }
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  static getSearchHistory(): any[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEYS.SEARCH_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('Failed to get search history:', error);
      return [];
    }
  }

  // Offline queue for when server is unavailable
  static addToOfflineQueue(action: string, data: any): void {
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        action,
        data,
        timestamp: Date.now(),
        id: Date.now().toString()
      });
      localStorage.setItem(this.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to add to offline queue:', error);
    }
  }

  static getOfflineQueue(): any[] {
    try {
      const queue = localStorage.getItem(this.STORAGE_KEYS.OFFLINE_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.warn('Failed to get offline queue:', error);
      return [];
    }
  }

  static removeFromOfflineQueue(id: string): void {
    try {
      const queue = this.getOfflineQueue().filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to remove from offline queue:', error);
    }
  }

  static clearOfflineQueue(): void {
    localStorage.removeItem(this.STORAGE_KEYS.OFFLINE_QUEUE);
  }

  // Sync tracking
  static setLastSyncTime(): void {
    localStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  }

  static getLastSyncTime(): number {
    try {
      const time = localStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      return time ? parseInt(time) : 0;
    } catch (error) {
      return 0;
    }
  }

  // Clear all cached data
  static clearAllCache(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      // Rough estimate of 5MB localStorage limit
      const available = 5 * 1024 * 1024;
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}