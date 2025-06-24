import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  ratedUser: {
    id: string;
    name: string;
    type: 'driver' | 'rider';
  };
}

export const RatingModal = ({ isOpen, onClose, booking, ratedUser }: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: booking.id,
          ratedUserId: ratedUser.id,
          rating,
          review: review.trim() || null
        })
      });

      if (response.ok) {
        toast({
          title: "Rating Submitted",
          description: `Thank you for rating your ${ratedUser.type}!`,
        });
        onClose();
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`text-3xl transition-colors ${
          star <= (hoveredRating || rating)
            ? 'text-yellow-400'
            : 'text-gray-300'
        } hover:text-yellow-400`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
      >
        <Star className="w-8 h-8 fill-current" />
      </button>
    ));
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Rate Your Trip</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              How was your experience with
            </p>
            <p className="font-semibold text-lg">{ratedUser.name}</p>
            <p className="text-sm text-gray-500 capitalize">({ratedUser.type})</p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Tap a star to rate:</p>
            <div className="flex justify-center space-x-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm font-medium text-gray-700">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave a review (optional)
            </label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Share your experience with ${ratedUser.name}...`}
              className="w-full"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {review.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Job ID: {booking.jobId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};