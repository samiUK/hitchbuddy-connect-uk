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
  const otherUser = isCurrentUserDriver 
    ? { name: 'Rider', type: 'rider' as const }
    : { name: 'Driver', type: 'driver' as const };

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
      
      // Simulate typing indicator for response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: isCurrentUserDriver ? booking.riderId : booking.driverId,
            senderName: otherUser.name,
            senderType: otherUser.type,
            message: isCurrentUserDriver 
              ? "Thanks for the message! I'll be ready for pickup." 
              : "Got it! I'll see you at the pickup location.",
            timestamp: new Date(),
            isRead: false
          };
          setMessages(prev => [...prev, autoReply]);
        }, 1500);
      }, 500);
      
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
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 shadow-2xl">
      <Card className="border-0 overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarFallback className="bg-white/20 text-white">
                  {otherUser.type === 'driver' ? <Car className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-semibold">{otherUser.name}</CardTitle>
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
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.senderId === currentUser.id ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
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
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center space-x-2">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherUser.name}...`}
                className="flex-1 border-gray-300 focus:border-blue-500"
                disabled={isSending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Press Enter to send</span>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{booking?.phoneNumber}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="max-h-64 overflow-y-auto p-3 space-y-3">
            {/* Rider's message */}
            <div className="flex">
              <div className="bg-gray-100 rounded-lg p-2 max-w-xs">
                <div className="text-xs text-gray-500 mb-1">{riderName}</div>
                <div className="text-sm">{riderMessage}</div>
              </div>
            </div>
            
            {/* Driver's response placeholder */}
            <div className="text-xs text-gray-400 text-center">
              Type your response below
            </div>
          </div>
          
          {/* Message input */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex space-x-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-0 resize-none text-sm"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                size="sm"
                className="self-end px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1 hidden sm:block">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};