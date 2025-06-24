import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Car, MessageCircle, Phone, Clock } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCurrentUserDriver = currentUser?.id === booking?.driverId;
  const otherUser = {
    name: booking?.otherUserName || (isCurrentUserDriver ? 'Rider' : 'Driver'),
    type: booking?.otherUserType || (isCurrentUserDriver ? 'rider' : 'driver'),
    avatar: booking?.otherUserAvatar
  };

  // Initialize messages with booking message
  useEffect(() => {
    if (booking?.message && messages.length === 0) {
      const initialMessage: Message = {
        id: 'initial',
        senderId: booking.riderId,
        senderName: 'Rider',
        senderType: 'rider',
        message: booking.message,
        timestamp: new Date(booking.createdAt),
        isRead: true
      };
      setMessages([initialMessage]);
    }
  }, [booking]);

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

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: isCurrentUserDriver ? 'Driver' : 'Rider',
      senderType: isCurrentUserDriver ? 'driver' : 'rider',
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsSending(true);
    
    try {
      await onSendMessage(newMessage.message);
    } catch (error) {
      console.error('Error sending message:', error);
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
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback className="bg-white/20 text-white">
                  {otherUser.type === 'driver' ? <Car className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold">
                  {otherUser.type === 'driver' ? 'Driver' : 'Rider'}: {otherUser.name}
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm opacity-90">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {booking?.status || 'Active'}
                  </Badge>
                  <span>•</span>
                  <span className="text-xs">Online</span>
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} items-start space-x-2`}
              >
                {/* Avatar for other user's messages only */}
                {msg.senderId !== currentUser.id && (
                  <Avatar className="w-6 h-6 md:w-8 md:h-8 mt-0.5">
                    <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                    <AvatarFallback className="text-xs">
                      {otherUser.type === 'driver' ? <Car className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[75%] md:max-w-[80%]`}>
                  <div
                    className={`px-3 md:px-4 py-2 rounded-2xl ${
                      msg.senderId === currentUser.id
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : msg.senderType === 'rider'
                          ? 'bg-green-500 text-white rounded-bl-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                  <div className={`flex items-center mt-1 space-x-2 ${
                    msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                    {msg.senderId === currentUser.id && (
                      <span className="text-xs text-gray-500">
                        {msg.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            

            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 bg-white border-t">
            <div className="flex items-center space-x-2">
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
                onClick={handleSendMessage} 
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