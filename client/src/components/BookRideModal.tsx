import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar, Clock, Users, PoundSterling, Phone, MessageSquare, Car, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookRideModalProps {
  ride: any;
  onClose: () => void;
  onBookingComplete: () => void;
}

export const BookRideModal = ({ ride, onClose, onBookingComplete }: BookRideModalProps) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    message: "",
    seatsRequested: "1"
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const { toast } = useToast();

  // Load available dates for recurring rides
  useEffect(() => {
    const loadAvailableDates = async () => {
      if (ride.isRecurring !== 'true') {
        setAvailableDates([]);
        return;
      }
      
      setIsLoadingDates(true);
      try {
        const dates = [];
        const today = new Date();
        const recurringData = ride.recurringData ? JSON.parse(ride.recurringData) : { selectedDays: [] };
        
        // Map day names to numbers (0 = Sunday, 1 = Monday, etc.)
        const dayNameToNumber: { [key: string]: number } = {
          'sunday': 0,
          'monday': 1,
          'tuesday': 2,
          'wednesday': 3,
          'thursday': 4,
          'friday': 5,
          'saturday': 6
        };
        
        // Convert selected day names to day numbers
        const selectedDayNumbers = recurringData.selectedDays?.map((day: string) => dayNameToNumber[day.toLowerCase()]).filter((num: number | undefined) => num !== undefined) || [];
        
        // Get existing bookings for this ride to check seat availability
        const bookingsResponse = await fetch(`/api/bookings/ride/${ride.id}`, {
          credentials: 'include'
        });
        const existingBookings = bookingsResponse.ok ? await bookingsResponse.json() : [];
        
        for (let i = 1; i < 60; i++) { // Start from tomorrow (i=1)
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          // Only include dates that match the driver's selected days
          if (selectedDayNumbers.length > 0) {
            const dayOfWeek = date.getDay();
            if (selectedDayNumbers.includes(dayOfWeek)) {
              const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              
              // Calculate total seats booked for this specific date
              const bookedSeatsForDate = existingBookings
                .filter((booking: any) => 
                  booking.selectedDate === dateString && 
                  booking.status === 'confirmed'
                )
                .reduce((total: number, booking: any) => total + parseInt(booking.seatsBooked), 0);
              
              // Only include date if there are available seats
              const availableSeats = parseInt(ride.availableSeats) || 0;
              if (bookedSeatsForDate < availableSeats) {
                dates.push(date);
              }
            }
          }
        }
        
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error loading available dates:', error);
        setAvailableDates([]);
      } finally {
        setIsLoadingDates(false);
      }
    };
    
    loadAvailableDates();
  }, [ride.id, ride.isRecurring, ride.recurringData, ride.availableSeats]);

  // Handle escape key and click outside to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date selection for recurring rides
    if (ride.isRecurring === 'true' && !selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a date for this recurring ride.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const bookingData = {
        rideId: ride.id,
        phoneNumber: formData.phoneNumber,
        message: formData.message,
        seatsBooked: parseInt(formData.seatsRequested),
        selectedDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        toast({
          title: "Booking request sent!",
          description: "Your booking request has been sent to the driver. You'll be notified when they respond.",
        });
        onBookingComplete();
        onClose();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send booking request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <span>Book This Ride</span>
          </CardTitle>
          <CardDescription>
            Fill in your details to request a booking for this ride
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Ride Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4 mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium">{ride.fromLocation}</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="font-medium">{ride.toLocation}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {ride.departureDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{ride.departureDate}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{ride.departureTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{ride.availableSeats} seats available</span>
              </div>
              <div className="flex items-center space-x-1">
                <PoundSterling className="h-4 w-4" />
                <span className="font-semibold">£{ride.price} per seat</span>
              </div>
            </div>
            {ride.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">"{ride.notes}"</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection for Recurring Rides */}
            {ride.isRecurring === 'true' && (
              <div>
                <Label className="flex items-center space-x-2 mb-3">
                  <CalendarDays className="h-4 w-4" />
                  <span>Select Date *</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !selectedDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date() || 
                        (ride.isRecurring === 'true' && !availableDates.some(availableDate => 
                          availableDate.toDateString() === date.toDateString()
                        ))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1">
                  Available dates based on the driver's recurring schedule
                  {availableDates.length > 0 && (
                    <span className="block mt-1 text-blue-600">
                      {availableDates.length} dates available in next 60 days
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone Number *</span>
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Your phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                The driver will contact you to confirm pickup details
              </p>
            </div>

            {/* Seats Requested */}
            <div>
              <Label htmlFor="seatsRequested" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Number of Seats *</span>
              </Label>
              <select
                id="seatsRequested"
                name="seatsRequested"
                value={formData.seatsRequested}
                onChange={(e) => setFormData(prev => ({ ...prev, seatsRequested: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {Array.from({ length: Math.min(ride.availableSeats, 4) }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} seat{i > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Message */}
            <div>
              <Label htmlFor="message" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Message to Driver (Optional)</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Any additional information or special requests..."
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Total Cost */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Cost:</span>
                <span className="text-[22px] font-bold text-blue-600">
                  £{(parseFloat(ride.price) * parseInt(formData.seatsRequested)).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formData.seatsRequested} seat{parseInt(formData.seatsRequested) > 1 ? 's' : ''} × £{ride.price} per seat
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Request..." : "Send Booking Request"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">What happens next?</p>
                <p className="text-yellow-700 mt-1">
                  1. Your booking request will be sent to the driver<br />
                  2. The driver will review and confirm your booking<br />
                  3. Once confirmed, a live chat will be activated for trip coordination<br />
                  4. You'll receive pickup details and can communicate directly with the driver
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};