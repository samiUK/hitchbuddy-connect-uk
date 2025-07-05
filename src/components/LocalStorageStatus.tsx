import { useState, useEffect } from 'react';
import { ClientStorage } from '../utils/clientStorage';

export const LocalStorageStatus = () => {
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStorageInfo = () => {
      setStorageInfo(ClientStorage.getStorageInfo());
    };

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 5000);

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (storageInfo.percentage < 50) return 'text-green-600';
    if (storageInfo.percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border text-xs">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-semibold">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between">
          <span>Local Storage:</span>
          <span className={getStatusColor()}>
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              storageInfo.percentage < 50 ? 'bg-green-500' : 
              storageInfo.percentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-center mt-1 text-gray-600">
          {storageInfo.percentage.toFixed(1)}% used
        </div>
      </div>

      {!isOnline && (
        <div className="mt-2 text-orange-600 text-xs">
          Working offline - data cached locally
        </div>
      )}
    </div>
  );
};