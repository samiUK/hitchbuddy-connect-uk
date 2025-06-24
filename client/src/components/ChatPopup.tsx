import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  riderMessage: string;
  riderName: string;
  onSendMessage: (message: string) => void;
}

export const ChatPopup = ({ isOpen, onClose, riderMessage, riderName, onSendMessage }: ChatPopupProps) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-blue-600 text-white p-3 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Chat with {riderName}</span>
            </CardTitle>
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
                className="flex-1 min-h-0 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};