import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, Clock, Users, Car, PoundSterling } from "lucide-react";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { useToast } from "@/hooks/use-toast";

interface ModifyRideModalProps {
  ride: any;
  onClose: () => void;
  onRideModified: () => void;
}

export const ModifyRideModal = ({ ride, onClose, onRideModified }: ModifyRideModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [fromLocation, setFromLocation] = useState(ride?.fromLocation || '');
  const [toLocation, setToLocation] = useState(ride?.toLocation || '');
  const [departureDate, setDepartureDate] = useState(ride?.departureDate || '');
  const [departureTime, setDepartureTime] = useState(ride?.departureTime || '');
  const [availableSeats, setAvailableSeats] = useState(ride?.availableSeats || 1);
  const [price, setPrice] = useState(ride?.price || '');
  const [vehicleInfo, setVehicleInfo] = useState(ride?.vehicleInfo || '');
  const [notes, setNotes] = useState(ride?.notes || '');
  const [isRecurring, setIsRecurring] = useState(ride?.isRecurring === 'true');
  const [recurringData, setRecurringData] = useState(() => {
    try {
      const parsed = ride?.recurringData ? JSON.parse(ride.recurringData) : null;
      return {
        frequency: parsed?.frequency || 'weekly',
        daysOfWeek: Array.isArray(parsed?.daysOfWeek) ? parsed.daysOfWeek : []
      };
    } catch {
      return { frequency: 'weekly', daysOfWeek: [] };
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        fromLocation,
        toLocation,
        departureDate,
        departureTime,
        availableSeats: parseInt(availableSeats.toString()),
        price: parseFloat(price.toString()),
        vehicleInfo,
        notes,
        isRecurring: isRecurring ? 'true' : 'false',
        recurringData: isRecurring ? JSON.stringify(recurringData) : null
      };

      const response = await fetch(`/api/rides/${ride.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast({
          title: "Ride Updated",
          description: "Your ride has been successfully updated.",
        });
        onRideModified();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ride');
      }
    } catch (error) {
      console.error('Error updating ride:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setRecurringData((prev: { frequency: string; daysOfWeek: string[] }) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d: string) => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5" />
            <span>Modify Your Ride</span>
            {ride?.rideId && (
              <Badge variant="outline" className="text-xs font-mono">
                {ride.rideId}
              </Badge>
            )}
            {ride?.isRecurring === 'true' && (
              <Badge variant="secondary" className="text-xs">
                Recurring
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Route Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromLocation">From</Label>
                <LocationAutocomplete
                  id="fromLocation"
                  name="fromLocation"
                  label=""
                  placeholder="Enter pickup location"
                  value={fromLocation}
                  onChange={setFromLocation}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="toLocation">To</Label>
                <LocationAutocomplete
                  id="toLocation"
                  name="toLocation"
                  label=""
                  placeholder="Enter destination"
                  value={toLocation}
                  onChange={setToLocation}
                  required
                />
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked === true)}
              />
              <Label htmlFor="recurring">This is a recurring ride</Label>
            </div>

            {isRecurring ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Frequency</Label>
                      <Select
                        value={recurringData.frequency}
                        onValueChange={(value) => setRecurringData(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recurringData.frequency === 'weekly' && (
                      <div>
                        <Label>Days of the Week</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {daysOfWeek.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={day.value}
                                checked={recurringData.daysOfWeek?.includes(day.value) || false}
                                onCheckedChange={() => handleDayToggle(day.value)}
                              />
                              <Label htmlFor={day.value}>{day.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {isRecurring && (
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Ride Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Ride Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="availableSeats">Available Seats</Label>
                <Select
                  value={availableSeats.toString()}
                  onValueChange={(value) => setAvailableSeats(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} seat{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price">Price per seat (£)</Label>
                <div className="relative">
                  <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    step="0.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-10"
                    placeholder="25.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="vehicleInfo">Vehicle</Label>
                <Input
                  id="vehicleInfo"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  placeholder="e.g., Red Toyota Prius"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for passengers..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Updating..." : "Update Ride"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};