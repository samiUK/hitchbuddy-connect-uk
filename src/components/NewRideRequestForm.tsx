
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Pound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewRideRequestFormProps {
  onClose: () => void;
}

export const NewRideRequestForm = ({ onClose }: NewRideRequestFormProps) => {
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    departureDate: "",
    departureTime: "",
    passengers: "1",
    maxPrice: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would normally submit to your backend
      console.log("Ride request submitted:", formData);
      
      toast({
        title: "Ride request posted!",
        description: "Drivers in your area will be notified. You'll receive updates when someone responds.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your ride request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span>New Ride Request</span>
        </CardTitle>
        <CardDescription>
          Let drivers know where you need to go and when
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromLocation">From</Label>
              <Input
                id="fromLocation"
                name="fromLocation"
                placeholder="Pickup location"
                value={formData.fromLocation}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toLocation">To</Label>
              <Input
                id="toLocation"
                name="toLocation"
                placeholder="Destination"
                value={formData.toLocation}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Departure Date</span>
              </Label>
              <Input
                id="departureDate"
                name="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input
                id="departureTime"
                name="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Passengers and Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengers" className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Number of Passengers</span>
              </Label>
              <Input
                id="passengers"
                name="passengers"
                type="number"
                min="1"
                max="4"
                value={formData.passengers}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="flex items-center space-x-1">
                <Pound className="h-4 w-4" />
                <span>Maximum Price</span>
              </Label>
              <Input
                id="maxPrice"
                name="maxPrice"
                type="number"
                placeholder="e.g. 25"
                value={formData.maxPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requirements or additional information..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isSubmitting ? "Posting..." : "Post Ride Request"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
