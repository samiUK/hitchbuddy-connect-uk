import { useState } from 'react';
import { Bell, MessageCircle, Calendar, CheckCircle, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  onNavigate?: (section: string) => void;
}

export const NotificationCenter = ({ onNavigate }: NotificationCenterProps) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'booking_request':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'booking_confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      
      // Close notification panel immediately
      setIsOpen(false);
      
      // Small delay to ensure state updates
      setTimeout(() => {
        // Navigate to relevant section based on notification type
        if (onNavigate) {
          switch (notification.type) {
            case 'booking_request':
              // Take drivers to "My Rides & Bookings" to see pending requests
              onNavigate('rides');
              break;
            case 'counter_offer':
              // Take riders to "My Trips & Bookings" to see counter offers
              onNavigate('rides');
              break;
            case 'booking_confirmed':
              // Take users to "My Trips & Bookings" to see confirmed bookings
              onNavigate('rides');
              break;
            case 'message':
              // Take users to "My Messages" tab to see conversations
              onNavigate('messages');
              break;
            case 'trip_request':
              // Take drivers to "Find Requests" to see new trip requests
              onNavigate('requests');
              break;
            default:
              // Default to overview
              onNavigate('overview');
              break;
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error handling notification click:', error);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg" align="end">
        <div className="bg-white dark:bg-gray-900 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await markAllAsRead();
                        setIsOpen(false);
                      } catch (error) {
                        console.error('Error marking all as read:', error);
                      }
                    }}
                    className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.filter(notification => !notification.isRead).length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No new notifications
              </div>
            ) : (
              <div>
                {notifications.filter(notification => !notification.isRead).map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      !notification.isRead 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                        : 'bg-white dark:bg-gray-900'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium text-gray-900 dark:text-white ${
                            !notification.isRead ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <div className="flex items-center mt-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};