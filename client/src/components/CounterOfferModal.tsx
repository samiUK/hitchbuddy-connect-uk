import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, User, Calendar, Clock, PoundSterling } from 'lucide-react';

interface CounterOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onCounterOfferSubmit: (requestId: string, offerPrice: number, message: string) => void;
}

export const CounterOfferModal = ({ isOpen, onClose, request, onCounterOfferSubmit }: CounterOfferModalProps) => {
  const [offerPrice, setOfferPrice] = useState(request?.maxPrice || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offerPrice || offerPrice <= 0) {
      alert('Please enter a valid offer price');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCounterOfferSubmit(request.id, parseFloat(offerPrice), message);
      setOfferPrice('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Counter offer failed:', error);
      alert('Failed to send counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PoundSterling className="h-5 w-5 text-green-600" />
            <span>Make Counter Offer</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">
                {request.fromLocation} → {request.toLocation}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{request.departureDate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{request.departureTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{request.passengers} passengers</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Rider's max budget: </span>
              <span className="font-semibold text-green-600">£{request.maxPrice}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Offer Price */}
            <div>
              <Label htmlFor="offerPrice" className="text-sm font-medium">
                Your Offer Price (£)
              </Label>
              <Input
                id="offerPrice"
                type="number"
                step="0.01"
                min="0"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter your price"
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your counter offer price for this trip
              </p>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message with your offer (optional)"
                className="mt-1 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                Explain your offer or provide additional details
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Sending...' : 'Send Counter Offer'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};