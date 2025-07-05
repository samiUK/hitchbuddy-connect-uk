
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, Users, PoundSterling, Car, Clock, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PostNewRideFormProps {
  onClose: () => void;
  savedData?: any;
  onDataChange?: (data: any) => void;
}

export const PostNewRideForm = ({ onClose, savedData, onDataChange }: PostNewRideFormProps) => {
  const [formData, setFormData] = useState(savedData || {
    fromLocation: "",
    toLocation: "",
    departureDate: "",
    departureTime: "",
    availableSeats: "3",
    price: "",
    vehicleInfo: "",
    notes: ""
  });
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
    frequency: "weekly", // weekly, daily, custom
    selectedDays: [] as string[],
    endDate: null as Date | null,
    customDates: [] as Date[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const daysOfWeek = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value
    };
    setFormData(newData);
    if (onDataChange) {
      onDataChange({ ...newData, isRecurring, recurringData });
    }
  };

  const handleLocationChange = (name: string, value: string) => {
    const newData = {
      ...formData,
      [name]: value
    };
    setFormData(newData);
    if (onDataChange) {
      onDataChange({ ...newData, isRecurring, recurringData });
    }
  };

  const handleDayToggle = (day: string) => {
    setRecurringData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setRecurringData(prev => ({
      ...prev,
      customDates: prev.customDates.some(d => d.toDateString() === date.toDateString())
        ? prev.customDates.filter(d => d.toDateString() !== date.toDateString())
        : [...prev.customDates, date]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const rideData = {
        ...formData,
        isRecurring,
        recurringData: isRecurring ? recurringData : null
      };
      
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(rideData),
      });

      if (response.ok) {
        toast({
          title: "Ride posted successfully!",
          description: isRecurring 
            ? "Your recurring ride has been posted. Passengers can now book seats."
            : "Your ride has been posted. Passengers can now book seats.",
        });
        onClose();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to post your ride. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-green-600" />
          <span>Post New Ride</span>
        </CardTitle>
        <CardDescription>
          Share your journey and help other travelers reach their destination
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <LocationAutocomplete
              id="fromLocation"
              name="fromLocation"
              label="From"
              placeholder="Departure location"
              value={formData.fromLocation}
              onChange={(value) => handleLocationChange("fromLocation", value)}
              required
            />
            <LocationAutocomplete
              id="toLocation"
              name="toLocation"
              label="To"
              placeholder="Destination"
              value={formData.toLocation}
              onChange={(value) => handleLocationChange("toLocation", value)}
              required
            />
          </div>

          {/* Recurring Ride Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Repeat className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <Label className="text-base font-medium">Recurring Ride</Label>
              <p className="text-sm text-gray-600">Offer this ride on multiple dates</p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {/* Date and Time Section */}
          {!isRecurring ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate" className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
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
                <Label htmlFor="departureTime" className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Departure Time</span>
                </Label>
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
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="departureTime" className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Departure Time</span>
                </Label>
                <Input
                  id="departureTime"
                  name="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Recurring Options */}
              <div className="space-y-4">
                <Label>Recurrence Pattern</Label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={recurringData.frequency === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecurringData(prev => ({ ...prev, frequency: "weekly" }))}
                  >
                    Weekly
                  </Button>
                  <Button
                    type="button"
                    variant={recurringData.frequency === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecurringData(prev => ({ ...prev, frequency: "daily" }))}
                  >
                    Daily
                  </Button>
                  <Button
                    type="button"
                    variant={recurringData.frequency === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecurringData(prev => ({ ...prev, frequency: "custom" }))}
                  >
                    Custom Dates
                  </Button>
                </div>

                {recurringData.frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label>Select Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Badge
                          key={day.value}
                          variant={recurringData.selectedDays.includes(day.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleDayToggle(day.value)}
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recurringData.frequency === "custom" && (
                  <div className="space-y-2">
                    <Label>Select Custom Dates</Label>
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurringData.customDates.length > 0 
                            ? `${recurringData.customDates.length} dates selected`
                            : "Select dates"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="multiple"
                          selected={recurringData.customDates}
                          onSelect={(dates) => setRecurringData(prev => ({ ...prev, customDates: dates || [] }))}
                          disabled={(date) => date < new Date()}
                          className={cn("p-3 pointer-events-auto")}
                        />
                        <div className="p-3 border-t">
                          <Button 
                            size="sm" 
                            onClick={() => setShowCalendar(false)}
                            className="w-full"
                          >
                            Done
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {recurringData.customDates.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recurringData.customDates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {format(date, "MMM dd")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(recurringData.frequency === "weekly" || recurringData.frequency === "daily") && (
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurringData.endDate ? format(recurringData.endDate, "PPP") : "No end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={recurringData.endDate || undefined}
                          onSelect={(date) => setRecurringData(prev => ({ ...prev, endDate: date || null }))}
                          disabled={(date) => date < new Date()}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seats and Price */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availableSeats" className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Available Seats</span>
              </Label>
              <Input
                id="availableSeats"
                name="availableSeats"
                type="number"
                min="1"
                max="7"
                value={formData.availableSeats}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center space-x-1">
                <PoundSterling className="h-4 w-4" />
                <span>Price per Seat</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="e.g. 25"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="space-y-2">
            <Label htmlFor="vehicleInfo">Vehicle Information</Label>
            <Input
              id="vehicleInfo"
              name="vehicleInfo"
              placeholder="e.g. Blue Honda Civic, License Plate: AB12 CDE"
              value={formData.vehicleInfo}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Pickup instructions, preferences, or any other information..."
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
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isSubmitting ? "Posting..." : "Post Ride"}
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
