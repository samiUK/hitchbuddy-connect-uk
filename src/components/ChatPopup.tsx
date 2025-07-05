import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Car, MessageCircle, Phone, Clock, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'rider' | 'driver';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  currentUser: any;
  onSendMessage: (message: string) => void;
}

export const ChatPopup = ({ isOpen, onClose, booking, currentUser, onSendMessage }: ChatPopupProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkIfMobile();
  }, []);

  const isCurrentUserDriver = currentUser?.id === booking?.driverId;
  
  console.log('ChatPopup - Current user:', currentUser);
  console.log('ChatPopup - Booking object:', booking);
  console.log('ChatPopup - Is current user driver:', isCurrentUserDriver);
  
  const otherUser = {
    name: booking?.otherUserName || (isCurrentUserDriver ? 'Rider' : 'Driver'),
    type: booking?.otherUserType || (isCurrentUserDriver ? 'rider' : 'driver'),
    avatar: booking?.otherUserAvatar
  };
  
  console.log('ChatPopup - Other user object:', otherUser);

  // Load chat history from database
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!booking?.id) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/bookings/${booking.id}/messages`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const loadedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            senderName: msg.senderId === currentUser?.id ? 
              `${currentUser.firstName} ${currentUser.lastName}` : 
              otherUser.name,
            senderType: msg.senderId === booking.driverId ? 'driver' : 'rider',
            message: msg.message,
            timestamp: new Date(msg.createdAt),
            isRead: true
          }));
          
          // Add initial booking message if it exists and no messages loaded
          if (booking.message && loadedMessages.length === 0) {
            const initialMessage: Message = {
              id: 'initial',
              senderId: booking.riderId,
              senderName: otherUser.name,
              senderType: 'rider',
              message: booking.message,
              timestamp: new Date(booking.createdAt),
              isRead: true
            };
            setMessages([initialMessage]);
          } else {
            setMessages(loadedMessages);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [booking?.id, currentUser, otherUser.name]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    if (!messageText) setMessage('');

    // Add message to local state immediately for better UX
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderType: currentUser.id === booking?.driverId ? 'driver' : 'rider',
      message: textToSend,
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      await onSendMessage(textToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the message from local state if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsSending(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      const locationMessage = `📍 Live Location: https://maps.google.com/maps?q=${latitude},${longitude}`;
      
      await handleSendMessage(locationMessage);
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please check your browser permissions.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-1rem)] md:max-w-[calc(100vw-2rem)] z-50 shadow-2xl">
      <Card className="border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 border-2 border-white/30 shadow-lg">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                  {otherUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold leading-tight">
                  {otherUser.name}
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm opacity-90 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-2 py-0.5">
                    {otherUser.type === 'driver' ? 'Driver' : 'Rider'}
                  </Badge>
                  <span className="text-xs">•</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Trip Details */}
        <div className="bg-gray-50 p-3 border-b">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>Trip: {booking?.fromLocation} → {booking?.toLocation}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{booking?.departureTime}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="p-0">
          <div className="h-64 md:h-80 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-sm text-gray-500">Loading chat history...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-sm text-gray-500">Start your conversation...</div>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUserMessage = msg.senderId === currentUser.id;
                const messageUserAvatar = isCurrentUserMessage ? currentUser.avatarUrl : otherUser.avatar;
                const isLocationMessage = msg.message.includes('📍 Live Location:');
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUserMessage ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {/* Avatar only for non-current user messages */}
                    {!isCurrentUserMessage && (
                      <Avatar className="w-6 h-6 md:w-8 md:h-8 mb-1">
                        <AvatarImage src={messageUserAvatar} alt={msg.senderName} />
                        <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-green-500 text-white">
                          {otherUser.type === 'driver' ? <Car className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[75%] md:max-w-[80%]`}>
                      {/* Sender name for group context */}
                      {!isCurrentUserMessage && (
                        <div className="text-xs text-gray-500 mb-1 ml-2">
                          {msg.senderName}
                        </div>
                      )}
                      
                      <div
                        className={`px-3 md:px-4 py-2 rounded-2xl shadow-sm ${
                          isCurrentUserMessage
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : msg.senderType === 'driver'
                              ? 'bg-indigo-500 text-white rounded-bl-md'
                              : 'bg-green-500 text-white rounded-bl-md'
                        }`}
                      >
                        {isLocationMessage ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm font-medium">Live Location Shared</span>
                            </div>
                            <a 
                              href={msg.message.split(': ')[1]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-sm underline hover:no-underline"
                            >
                              <Navigation className="h-3 w-3" />
                              <span>Open in Maps</span>
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        )}
                      </div>
                      
                      <div className={`flex items-center mt-1 space-x-2 ${
                        isCurrentUserMessage ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                        {isCurrentUserMessage && (
                          <span className="text-xs text-gray-500">
                            {msg.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 bg-white border-t">
            <div className="flex items-center space-x-2">
              {isMobile && (
                <Button
                  onClick={shareLocation}
                  disabled={isSending}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                  title="Share live location"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              )}
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherUser.type}...`}
                className="flex-1 border-gray-300 focus:border-blue-500 text-sm"
                disabled={isSending}
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={!message.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4"
                size="sm"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span className="hidden md:inline">Press Enter to send</span>
              <span className="md:hidden">Tap send</span>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{booking?.phoneNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};