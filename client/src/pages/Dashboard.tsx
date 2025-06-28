
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Car, 
  User, 
  Users,
  MapPin, 
  Clock, 
  Star, 
  Search,
  MessageCircle,
  Settings,
  LogOut,
  Navigation,
  Edit,
  RefreshCw,
  Calendar,
  PoundSterling,
  Check,
  X,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuthNew";
import { NewRideRequestForm } from "@/components/NewRideRequestForm";
import { PostNewRideForm } from "@/components/PostNewRideForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { BookRideModal } from "@/components/BookRideModal";
import { ChatPopup } from "@/components/ChatPopup";
import { BetaDisclaimer } from "@/components/BetaDisclaimer";
import { NotificationCenter } from "@/components/NotificationCenter";
import { RatingModal } from "@/components/RatingModal";
import { CounterOfferModal } from "@/components/CounterOfferModal";
import { ModifyRideModal } from "@/components/ModifyRideModal";
import { useToast } from "@/hooks/use-toast";
import { formatDateToDDMMYYYY, formatDateWithRecurring } from "@/lib/dateUtils";

const Dashboard = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'post' | 'rides' | 'requests' | 'messages'>('overview');
  const [showRideRequestForm, setShowRideRequestForm] = useState(false);
  const [showPostRideForm, setShowPostRideForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isUpdatingUserType, setIsUpdatingUserType] = useState(false);
  const [rides, setRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [savedFormData, setSavedFormData] = useState<any>(null);
  const [formDataTimestamp, setFormDataTimestamp] = useState<number | null>(null);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quickActionsDismissed, setQuickActionsDismissed] = useState(false);
  const [showModifyRideModal, setShowModifyRideModal] = useState(false);
  const [selectedRideToModify, setSelectedRideToModify] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const userType = user?.userType || 'rider';

  // Navigation handler for notifications
  const handleNotificationNavigation = (section: string) => {
    const validTabs = ['overview', 'post', 'rides', 'requests', 'messages'] as const;
    type ValidTab = typeof validTabs[number];
    
    if (validTabs.includes(section as ValidTab)) {
      setActiveTab(section as ValidTab);
    } else {
      setActiveTab('overview');
    }
  };
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!user) return { score: 0, total: 0, missing: [] };
    
    const requiredFields = [
      { field: 'firstName', label: 'First Name', value: user.firstName },
      { field: 'lastName', label: 'Last Name', value: user.lastName },
      { field: 'phone', label: 'Phone Number', value: user.phone },
      { field: 'city', label: 'City', value: user.city },
      { field: 'avatarUrl', label: 'Profile Photo', value: user.avatarUrl }
    ];

    const completed = requiredFields.filter(field => field.value && field.value.trim() !== '');
    const missing = requiredFields.filter(field => !field.value || field.value.trim() === '');
    
    return {
      score: completed.length,
      total: requiredFields.length,
      percentage: Math.round((completed.length / requiredFields.length) * 100),
      missing: missing.map(field => field.label)
    };
  };

  const profileCompleteness = calculateProfileCompleteness();

  useEffect(() => {
    if (user) {
      fetchData();
      fetchConversations();
    }
  }, [user, userType]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    setMessagesLoading(true);
    try {
      const response = await fetch('/api/conversations', { credentials: 'include' });
      if (response.ok) {
        const conversationsData = await response.json();
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (userType === 'driver') {
        // Fetch available ride requests for drivers
        const requestsResponse = await fetch('/api/ride-requests', {
          credentials: 'include'
        });
        if (requestsResponse.ok) {
          const data = await requestsResponse.json();
          setRideRequests(data.rideRequests || []);
        }
        
        // Fetch driver's own rides
        const myRidesResponse = await fetch('/api/rides/my', {
          credentials: 'include'
        });
        if (myRidesResponse.ok) {
          const data = await myRidesResponse.json();
          setRides(data.rides || []);
        }
      } else {
        // Fetch available rides for riders (only riders should see rides)
        const ridesResponse = await fetch('/api/rides', {
          credentials: 'include'
        });
        if (ridesResponse.ok) {
          const data = await ridesResponse.json();
          setRides(data.rides || []);
        }
        
        // Fetch rider's own requests
        const myRequestsResponse = await fetch('/api/ride-requests/my', {
          credentials: 'include'
        });
        if (myRequestsResponse.ok) {
          const data = await myRequestsResponse.json();

          setRideRequests(data.rideRequests || []);
        } else {
          console.error('Failed to fetch rider requests:', myRequestsResponse.status);
        }
      }

      // Fetch bookings for all users
      const bookingsResponse = await fetch('/api/bookings', {
        credentials: 'include'
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
        
        // Create notifications for drivers about pending booking requests only (not ride requests)
        if (userType === 'driver') {
          const pendingBookings = bookingsData.bookings.filter(b => 
            b.status === 'pending' && b.driverId === user?.id && b.rideId // Only for actual ride bookings, not ride requests
          );
          setNotifications(pendingBookings.map(booking => ({
            id: booking.id,
            type: 'booking_request',
            message: `New booking request from rider`,
            booking: booking
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      // Check if this is a counter offer decline or driver cancellation
      const booking = bookings.find(b => b.id === bookingId);
      const isCounterOfferDecline = action === 'cancelled' && booking?.rideId && 
        rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'));
      
      // Check if this is a driver cancelling a booking request (should return to global pool)
      const isDriverCancellation = action === 'cancelled' && booking?.rideRequestId && 
        user?.userType === 'driver';

      if (isCounterOfferDecline || isDriverCancellation) {
        // For declined counter offers or driver cancellations, call special endpoint to reactivate original request
        const response = await fetch(`/api/bookings/${bookingId}/decline-counter-offer`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const message = isCounterOfferDecline 
            ? "Your request has been returned to the Find Requests section for other drivers to see."
            : "The request has been returned to the Find Requests section for all drivers to see.";
          
          toast({
            title: isCounterOfferDecline ? "Counter offer declined" : "Request cancelled",
            description: message,
          });
          setQuickActionsDismissed(true);
          fetchData();
          return;
        }
      }

      // Regular booking action
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        toast({
          title: action === 'confirmed' ? "Booking confirmed!" : action === 'completed' ? "Trip completed!" : "Booking declined",
          description: action === 'confirmed' 
            ? "The rider has been notified and can now contact you."
            : action === 'completed'
            ? "The trip has been marked as completed and moved to Past Rides."
            : "The booking has been declined.",
        });
        setQuickActionsDismissed(true); // Dismiss quick actions after action is taken
        fetchData(); // Refresh data
      } else {
        toast({
          title: "Error",
          description: "Failed to update booking status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormDataSave = (formData: any) => {
    setSavedFormData(formData);
    setFormDataTimestamp(Date.now());
  };

  const getSavedFormData = () => {
    // Data expires after 5 minutes
    if (formDataTimestamp && Date.now() - formDataTimestamp < 5 * 60 * 1000) {
      return savedFormData;
    }
    return null;
  };

  const clearSavedFormData = () => {
    setSavedFormData(null);
    setFormDataTimestamp(null);
  };

  const handleMessageRider = async (booking: any) => {
    const ride = rides.find(r => r.id === booking.rideId);
    
    // Get user details for the chat
    let otherUserDetails = {};
    if (user?.userType === 'driver') {
      // Driver messaging rider - get rider details
      try {
        const response = await fetch(`/api/auth/user/${booking.riderId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const riderData = await response.json();
          otherUserDetails = {
            otherUserName: `${riderData.user.firstName} ${riderData.user.lastName}`,
            otherUserAvatar: riderData.user.avatarUrl,
            otherUserType: 'rider'
          };
        }
      } catch (error) {
        console.error('Error fetching rider details:', error);
        otherUserDetails = {
          otherUserName: 'Rider',
          otherUserAvatar: null,
          otherUserType: 'rider'
        };
      }
    } else {
      // Rider messaging driver - get driver details
      try {
        const response = await fetch(`/api/auth/user/${booking.driverId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const driverData = await response.json();
          otherUserDetails = {
            otherUserName: `${driverData.user.firstName} ${driverData.user.lastName}`,
            otherUserAvatar: driverData.user.avatarUrl,
            otherUserType: 'driver'
          };
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
        otherUserDetails = {
          otherUserName: 'Driver',
          otherUserAvatar: null,
          otherUserType: 'driver'
        };
      }
    }

    setSelectedBooking({
      ...booking,
      ...otherUserDetails,
      fromLocation: ride?.fromLocation || 'Unknown',
      toLocation: ride?.toLocation || 'Unknown',
      departureTime: ride?.departureTime || 'Unknown'
    });
    setShowChatPopup(true);
  };

  const handleCounterOffer = (request: any) => {
    setSelectedRequest(request);
    setShowCounterOfferModal(true);
  };

  const handleCounterOfferBooking = (booking: any) => {
    // Convert booking to request format for counter offer modal
    const requestForModal = {
      id: booking.id,
      riderId: booking.riderId,
      fromLocation: rides.find(r => r.id === booking.rideId)?.fromLocation || '',
      toLocation: rides.find(r => r.id === booking.rideId)?.toLocation || '',
      departureDate: rides.find(r => r.id === booking.rideId)?.departureDate || '',
      departureTime: rides.find(r => r.id === booking.rideId)?.departureTime || '',
      passengers: booking.seatsBooked,
      maxPrice: booking.totalCost,
      notes: booking.message || '',
      isBookingRequest: true,
      originalBookingId: booking.id
    };
    setSelectedRequest(requestForModal);
    setShowCounterOfferModal(true);
  };

  const handleConfirmRideRequest = async (request: any) => {
    try {
      // First create a ride for this confirmed request
      const rideResponse = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fromLocation: request.fromLocation,
          toLocation: request.toLocation,
          departureDate: request.departureDate,
          departureTime: request.departureTime,
          availableSeats: request.passengers,
          price: request.maxPrice,
          vehicleInfo: '',
          notes: `Confirmed ride for ${request.passengers} passenger${request.passengers > 1 ? 's' : ''}`,
          isRecurring: 'false',
          status: 'confirmed'
        }),
      });

      if (!rideResponse.ok) {
        throw new Error('Failed to create ride');
      }

      const newRide = await rideResponse.json();

      // Then create a confirmed booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rideId: newRide.id,
          rideRequestId: request.id,
          riderId: request.riderId,
          seatsBooked: request.passengers,
          totalCost: request.maxPrice,
          status: 'confirmed',
          phoneNumber: request.phoneNumber || '',
          message: 'Request confirmed by driver'
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      // Update the ride request status to 'matched'
      const updateRequestResponse = await fetch(`/api/ride-requests/${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'matched'
        }),
      });

      if (updateRequestResponse.ok) {
        toast({
          title: "Ride request confirmed!",
          description: "The rider has been notified and your trip is now confirmed.",
        });
        setQuickActionsDismissed(true); // Dismiss quick actions after action is taken
        fetchData();
      } else {
        toast({
          title: "Error",
          description: "Failed to update ride request status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error confirming ride request:', error);
      toast({
        title: "Error",
        description: "Failed to confirm ride request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCounterOfferSubmit = async (requestId: string, offerPrice: number, message: string) => {
    try {
      // Check if this is a booking request counter offer
      if (selectedRequest?.isBookingRequest) {
        // For booking requests, we create a new counter offer booking
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            riderId: selectedRequest.riderId,
            seatsBooked: selectedRequest.passengers || 1,
            totalCost: offerPrice,
            status: 'pending',
            message: message || `Counter offer: £${offerPrice}`,
            phoneNumber: null // Counter offers don't need phone number initially
          }),
        });

        if (response.ok) {
          // Update the original booking status to declined
          await fetch(`/api/bookings/${selectedRequest.originalBookingId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              status: 'cancelled'
            }),
          });

          toast({
            title: "Counter offer sent!",
            description: "Your counter offer has been sent to the rider for review.",
          });
          setQuickActionsDismissed(true);
          fetchData();
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Failed to send counter offer. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // Original logic for ride request counter offers
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            rideRequestId: requestId,
            seatsBooked: selectedRequest?.passengers || 1,
            totalCost: offerPrice,
            status: 'pending',
            message: message || `Counter offer: £${offerPrice}`
          }),
        });

        if (response.ok) {
          toast({
            title: "Counter offer sent!",
            description: "Your counter offer has been sent to the rider for review.",
          });
          setQuickActionsDismissed(true);
          fetchData();
        } else {
          const errorData = await response.json();
          toast({
            title: "Error",
            description: errorData.error || "Failed to send counter offer. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error sending counter offer:', error);
      toast({
        title: "Error",
        description: "Failed to send counter offer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          message: message,
        }),
      });

      if (response.ok) {
        toast({
          title: "Message sent!",
          description: "Your message has been sent to the rider.",
        });
        // Refresh conversations to update unread counts and message previews
        fetchConversations();
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUserTypeSwitch = async (newUserType: 'rider' | 'driver') => {
    if (isUpdatingUserType) return;
    
    setIsUpdatingUserType(true);
    
    try {
      const { error } = await updateProfile({ userType: newUserType });

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account type updated",
          description: `You are now a ${newUserType}`,
        });
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      toast({
        title: "Error",
        description: "Failed to update account type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUserType(false);
    }
  };

  const handleModifyRide = async (rideId: string) => {
    const ride = rides.find((r: any) => r.id === rideId);
    if (ride) {
      setSelectedRideToModify(ride);
      setShowModifyRideModal(true);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Ride Cancelled",
          description: "Your ride has been successfully cancelled.",
        });
        fetchData(); // Refresh the data
      } else {
        throw new Error('Failed to cancel ride');
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      toast({
        title: "Error",
        description: "Failed to cancel ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModifyRequest = async (requestId: string) => {
    // TODO: Implement modify request functionality
    toast({
      title: "Feature Coming Soon",
      description: "Request modification will be available in the next update.",
    });
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/ride-requests/${requestId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Request Cancelled",
          description: "Your ride request has been successfully cancelled.",
        });
        fetchData(); // Refresh the data
      } else {
        throw new Error('Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Hitchbuddy
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                {/* User Profile Info */}
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={user?.avatarUrl || undefined} 
                      alt={`${firstName} ${lastName}`}
                      onError={() => {}}
                      onLoad={() => {}}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs">
                      {firstName.charAt(0)}{lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {firstName} {lastName}
                  </span>
                  <Badge variant={userType === 'driver' ? 'default' : 'secondary'}>
                    {userType}
                  </Badge>
                </div>
              </div>
              
              {/* Notification Center */}
              <NotificationCenter onNavigate={handleNotificationNavigation} />
              
              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileEdit(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Switch Account Type</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => handleUserTypeSwitch('rider')}
                    disabled={userType === 'rider' || isUpdatingUserType}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Switch to Rider</span>
                    {userType === 'rider' && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleUserTypeSwitch('driver')}
                    disabled={userType === 'driver' || isUpdatingUserType}
                  >
                    <Car className="mr-2 h-4 w-4" />
                    <span>Switch to Driver</span>
                    {userType === 'driver' && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        

        {/* Quick Actions & Notifications */}
        {notifications.length > 0 && !quickActionsDismissed && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-orange-800">Quick Actions</CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setQuickActionsDismissed(true)}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium">{notification.message}</span>
                      <Badge variant="secondary">New</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setActiveTab('rides');
                        setQuickActionsDismissed(true);
                      }}
                    >
                      View Request
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Navigation },
            { id: 'rides', label: userType === 'driver' ? 'My Rides & Bookings' : 'My Rides & Bookings', icon: Car },
            { id: 'requests', label: userType === 'driver' ? 'Find Requests' : 'Available Rides', icon: userType === 'driver' ? Search : Search },
            { id: 'messages', label: 'My Messages', icon: MessageCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'rides' && notifications.length > 0 && userType === 'driver' && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {notifications.length}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && !showProfileEdit && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Overview Stats */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {userType === 'driver' ? 'Live Rides' : 'Live Requests'}
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userType === 'driver' 
                        ? rides.filter(r => r.driverId === user?.id && r.status === 'active' && !r.notes?.includes('Counter offer')).length 
                        : (() => {
                            // For riders: count ride requests that are still pending (not matched/confirmed)
                            const pendingRequests = rideRequests.filter(req => 
                              req.riderId === user?.id && req.status === 'active'
                            );
                            
                            // Filter out requests that have been confirmed (have confirmed bookings)
                            const unconfirmedRequests = pendingRequests.filter(request => {
                              const hasConfirmedBooking = bookings.some(booking => 
                                booking.riderId === user?.id &&
                                booking.status === 'confirmed' &&
                                // Check if this booking matches the request by route and date/time
                                rides.some(ride => 
                                  ride.id === booking.rideId &&
                                  ride.fromLocation === request.fromLocation &&
                                  ride.toLocation === request.toLocation &&
                                  ride.departureDate === request.departureDate &&
                                  ride.departureTime === request.departureTime
                                )
                              );
                              return !hasConfirmedBooking;
                            });
                            
                            return unconfirmedRequests.length;
                          })()
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userType === 'driver' ? 'Posted rides currently live' : 'Pending requests awaiting confirmation'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
                    <p className="text-xs text-muted-foreground">
                      {userType === 'driver' ? 'Confirmed bookings' : 'Your upcoming rides'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(() => {
                        let count = 0;
                        
                        if (userType === 'driver') {
                          // Driver: count completed rides where user was the driver
                          count = bookings.filter((b: any) => b.driverId === user?.id && b.status === 'completed').length;
                        } else {
                          // Rider: count completed rides where user was the rider
                          count = bookings.filter((b: any) => b.riderId === user?.id && b.status === 'completed').length;
                        }
                        
                        return count;
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userType === 'driver' ? 'Rides you completed' : 'Rides you took'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {userType === 'driver' ? 'Ride completed' : 'Booking confirmed'}
                        </p>
                        <p className="text-sm text-gray-500">London to Manchester • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No recent activity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {userType === 'driver' ? 'Rides Offered' : 'Rides Taken'}
                      </span>
                      <span className="font-semibold">{rides.filter(r => userType === 'driver' ? r.driverId === user?.id : false).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">
                          {profileCompleteness.percentage === 100 ? '5.0' : 'New User'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {userType === 'driver' ? 'Earnings' : 'Money Saved'}
                      </span>
                      <span className="font-semibold">£{bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + parseFloat(b.totalCost || '0'), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${profileCompleteness.percentage < 100 ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`} onClick={profileCompleteness.percentage < 100 ? () => setShowProfileEdit(true) : undefined}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Status</CardTitle>
                    <Badge variant={profileCompleteness.percentage === 100 ? "default" : "secondary"} className="ml-2">
                      {profileCompleteness.percentage}%
                    </Badge>
                  </div>
                  <CardDescription>
                    {profileCompleteness.percentage === 100 
                      ? "Your profile is complete!" 
                      : "Click to complete your profile"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            profileCompleteness.percentage === 100 
                              ? 'bg-green-500' 
                              : profileCompleteness.percentage >= 75 
                                ? 'bg-blue-500' 
                                : profileCompleteness.percentage >= 50 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${profileCompleteness.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {profileCompleteness.score} of {profileCompleteness.total} fields completed
                      </p>
                    </div>

                    {/* Missing Fields - Only show if profile is incomplete */}
                    {profileCompleteness.percentage < 100 && profileCompleteness.missing.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Missing:</p>
                        <div className="flex flex-wrap gap-1">
                          {profileCompleteness.missing.slice(0, 3).map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {profileCompleteness.missing.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{profileCompleteness.missing.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Complete Button - Only show if profile is not complete */}
                    {profileCompleteness.percentage < 100 && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProfileEdit(true);
                        }}
                      >
                        Complete Profile
                      </Button>
                    )}

                    {/* Success Message */}
                    {profileCompleteness.percentage === 100 && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">Profile Complete!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}



        {/* Profile Edit Form */}
        {showProfileEdit && (
          <ProfileEditForm onClose={() => setShowProfileEdit(false)} />
        )}

        {activeTab === 'rides' && !showProfileEdit && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {userType === 'driver' ? (
                <div className="space-y-6">
                  {/* My Posted Rides Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">My Posted Rides</h3>
                        <Badge variant="outline" className="text-blue-600">
                          {rides.filter(ride => ride.driverId === user?.id && ride.status === 'active' && !ride.notes?.includes('Counter offer')).length} active
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowPostRideForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Ride
                      </Button>
                    </div>
                    
                    {rides.filter(ride => ride.driverId === user?.id && ride.status === 'active' && !ride.notes?.includes('Counter offer')).length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active ride posts</p>
                        <p className="text-sm mt-1">Post a new ride to find passengers</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {rides.filter(ride => ride.driverId === user?.id && ride.status === 'active' && !ride.notes?.includes('Counter offer')).map((ride) => (
                          <Card key={ride.id} className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                              <div className="flex justify-between">
                                <div className="flex-1">
                                  <div className="flex space-x-2 mb-2">
                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                      Posted Ride
                                    </Badge>
                                    <Badge className="bg-blue-600">
                                      Active
                                    </Badge>
                                  </div>
                                  
                                  <div className="mb-2">
                                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                      {ride.rideId || (ride.isRecurring === 'true' ? 'RECURRING-POST' : 'RB-PENDING')}
                                    </Badge>
                                    <div className="flex items-center space-x-2 text-sm">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">{ride.fromLocation || 'Not specified'} → {ride.toLocation || 'Not specified'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDateWithRecurring(ride.departureDate, ride.isRecurring)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{ride.departureTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{ride.availableSeats} seats</span>
                                    </div>
                                  </div>
                                  
                                  {ride.notes && (
                                    <div className="text-sm text-gray-600">
                                      <p><strong>Notes:</strong> {ride.notes}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right ml-4 flex flex-col justify-between">
                                  <div className="font-semibold text-blue-600 text-[22px] mb-2">£{ride.price}</div>
                                  <div className="flex flex-col space-y-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleModifyRide(ride.id)}
                                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Modify
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleCancelRide(ride.id)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Counter Offers Sent Section - Only for counter offers sent by this driver */}
                  {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 text-left">Counter Offers Sent</h3>
                        <Badge variant="outline" className="text-orange-600">
                          {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).length} pending
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).map((booking: any) => {
                          const relatedRide = rides.find(r => r.id === booking.rideId);
                          return (
                            <Card key={booking.id} className="p-4 border-orange-300 bg-orange-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                    {booking.jobId || 'CO-' + booking.id?.slice(-6)}
                                  </Badge>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">
                                      {relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}
                                    </span>

                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                    {relatedRide?.departureDate && (
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDateToDDMMYYYY(relatedRide.departureDate)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{relatedRide?.departureTime || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{booking.seatsBooked || relatedRide?.availableSeats || 1} passenger{(booking.seatsBooked || relatedRide?.availableSeats || 1) > 1 ? 's' : ''}</span>
                                    </div>
                                  </div>
                                  {booking.message && (
                                    <div className="bg-white p-3 rounded-lg text-sm mb-2">
                                      <p className="text-gray-700 font-medium">Your offer message:</p>
                                      <p className="text-gray-700 mt-1">"{booking.message}"</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-[22px] font-bold text-orange-600 mb-2">
                                    £{booking.totalCost}
                                  </div>
                                  <div className="flex flex-col space-y-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleCounterOffer(relatedRide)}
                                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Revise Offer
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel Offer
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Rides Section - includes all confirmed bookings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Upcoming Rides</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'confirmed').map((booking: any) => {
                        const relatedRide = rides.find(r => r.id === booking.rideId);
                        return (
                          <Card key={booking.id} className="p-4 border-green-300 bg-green-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                  {relatedRide?.rideId || 'RB-PENDING'}
                                </Badge>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}</span>
                                  <Badge variant="default" className="bg-green-600">
                                    Confirmed
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {relatedRide?.departureDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDateToDDMMYYYY(relatedRide.departureDate)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{relatedRide?.departureTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{booking.seatsBooked} seats</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p><strong>Rider Phone:</strong> {booking.phoneNumber}</p>
                                  {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[22px] font-bold text-green-600 mb-2">
                                  £{booking.totalCost}
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleMessageRider(booking)}
                                    className="relative"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message Rider
                                    {booking.hasUnreadMessages && (
                                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                  </Button>
                                  <div className="flex space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'completed')}
                                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 text-xs"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 text-xs"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'confirmed').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No upcoming rides yet.</p>
                          <p className="text-sm">Confirmed bookings will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Past Rides Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Past Rides</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.driverId === user?.id && (booking.status === 'completed' || booking.status === 'cancelled')).map((booking: any) => {
                        const relatedRide = rides.find(r => r.id === booking.rideId);
                        return (
                          <Card key={booking.id} className={`p-4 ${booking.status === 'cancelled' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                  {relatedRide?.rideId || 'RB-PENDING'}
                                </Badge>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}</span>
                                  <Badge variant={booking.status === 'completed' ? 'secondary' : 'destructive'}>
                                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {relatedRide?.departureDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDateToDDMMYYYY(relatedRide.departureDate)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{relatedRide?.departureTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{booking.seatsBooked} seats</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[22px] font-bold text-gray-600 mb-2">
                                  £{booking.totalCost}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bookings.filter(booking => booking.driverId === user?.id && (booking.status === 'completed' || booking.status === 'cancelled')).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No past rides yet.</p>
                          <p className="text-sm">Completed and cancelled rides will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Riders see their bookings with same structure
                <div className="space-y-6">
                  {/* Counter Offers Section - show all counter offers received by this rider */}
                  {bookings.filter((booking: any) => booking.riderId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Counter Offers</h3>
                        <Badge variant="outline" className="text-orange-600">
                          {bookings.filter((booking: any) => booking.riderId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).length} pending
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4">
                        {bookings.filter((booking: any) => booking.riderId === user?.id && booking.status === 'pending' && booking.rideId && rides.find(r => r.id === booking.rideId && r.rideId && r.rideId.startsWith('CO-'))).map((offer: any) => {
                          const counterOfferRide = rides.find(r => r.id === offer.rideId);
                          // For counter offers, find the original request by matching ride details
                          const relatedRequest = rideRequests.find(req => 
                            req.fromLocation === counterOfferRide?.fromLocation &&
                            req.toLocation === counterOfferRide?.toLocation &&
                            req.riderId === user?.id &&
                            req.status === 'active'
                          );
                          return (
                            <Card key={offer.id} className="border-orange-200 bg-orange-50">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                      {counterOfferRide?.rideId || offer.jobId || 'CO-' + offer.id?.slice(-6)}
                                    </Badge>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium">
                                        {counterOfferRide?.fromLocation || 'Not specified'} → {counterOfferRide?.toLocation || 'Not specified'}
                                      </span>
                                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        Counter Offer
                                      </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                      {counterOfferRide?.departureDate && (
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-4 w-4" />
                                          <span>{formatDateToDDMMYYYY(counterOfferRide.departureDate)}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{counterOfferRide?.departureTime || 'Not specified'}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{offer.seatsBooked} passenger{offer.seatsBooked > 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                      <span className="font-medium">Your original budget:</span> £{relatedRequest?.maxPrice || 'Not specified'}
                                    </div>
                                    {counterOfferRide?.notes && (
                                      <div className="bg-white p-3 rounded-lg text-sm mb-2">
                                        <p className="text-gray-700 font-medium">Driver's message:</p>
                                        <p className="text-gray-700 mt-1">"{counterOfferRide.notes}"</p>
                                      </div>
                                    )}
                                    {relatedRequest?.notes && (
                                      <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Your original request:</span> "{relatedRequest.notes}"
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-[22px] font-bold text-orange-600 mb-2">
                                      £{offer.totalCost}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleBookingAction(offer.id, 'confirmed')}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Accept Offer
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleBookingAction(offer.id, 'cancelled')}
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Decline
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* My Live Requests Section (only for riders) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900 text-left">My Live Requests</h3>
                        <Badge variant="outline" className="text-blue-600">
                          {rideRequests.filter((req: any) => req.status === 'active').length} active
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowRideRequestForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Request New Ride
                      </Button>
                    </div>
                    
                    {rideRequests.filter((req: any) => req.status === 'active').length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active ride requests</p>
                        <p className="text-sm mt-1">Submit a ride request to find drivers</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {rideRequests.filter(req => {
                          // Check if this request has been confirmed by looking for a confirmed booking
                          // that matches the request's route and rider
                          const hasConfirmedBooking = bookings.some(booking => 
                            booking.riderId === req.riderId && 
                            booking.status === 'confirmed' &&
                            rides.some(ride => 
                              ride.id === booking.rideId &&
                              ride.fromLocation === req.fromLocation &&
                              ride.toLocation === req.toLocation &&
                              ride.departureDate === req.departureDate
                            )
                          );
                          return (req.status === 'active' || req.status === 'pending') && 
                                 req.status !== 'matched' && 
                                 !hasConfirmedBooking;
                        }).map((request) => (
                          <Card key={request.id} className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="mb-3">
                                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                                      Ride Request
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-900">{request.fromLocation}</span>
                                      <span className="text-gray-500">→</span>
                                      <span className="text-gray-900">{request.toLocation}</span>
                                      <Badge className={request.status === 'matched' ? "bg-green-600" : "bg-orange-600"} size="sm">
                                        {request.status === 'matched' ? 'Confirmed' : 'Pending'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDateToDDMMYYYY(request.departureDate)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{request.departureTime}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{request.passengers} passenger{request.passengers > 1 ? 's' : ''}</span>
                                      </div>
                                    </div>
                                    
                                    {request.notes && (
                                      <div className="pt-2 border-t border-blue-200">
                                        <p className="text-sm text-gray-600 italic">"{request.notes}"</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right ml-4">
                                  <div className="text-[22px] font-bold text-green-600 mb-2">
                                    £{request.maxPrice}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-3">Max Budget</div>
                                  <div className="flex flex-col space-y-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleModifyRequest(request.id)}
                                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <Edit className="h-3 w-3 mr-1" />
                                      Modify
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleCancelRequest(request.id)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      </div>
                    )}
                  </div>

                  {/* Upcoming Rides Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Upcoming Rides</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'confirmed').map((booking: any) => {
                        const relatedRide = rides.find(r => r.id === booking.rideId);
                        return (
                          <Card key={booking.id} className="p-4 border-green-300 bg-green-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                  {relatedRide?.rideId || 'RB-PENDING'}
                                </Badge>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}</span>
                                  <Badge variant="default" className="bg-green-600">
                                    Confirmed
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {relatedRide?.departureDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>({formatDateToDDMMYYYY(relatedRide.departureDate)})</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{relatedRide?.departureTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{booking.seatsBooked} seats</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[22px] font-bold text-green-600 mb-2">
                                  £{booking.totalCost}
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleMessageRider(booking)}
                                    className="relative"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    Message Driver
                                    {booking.hasUnreadMessages && (
                                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                                  </Button>
                                  <div className="flex space-x-1">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'completed')}
                                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 text-xs"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300 text-xs"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'confirmed').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No upcoming rides yet.</p>
                          <p className="text-sm">Book a ride to see it here.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Past Rides Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-left">Past Rides</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.riderId === user?.id && (booking.status === 'completed' || booking.status === 'cancelled')).map((booking: any) => {
                        const relatedRide = rides.find(r => r.id === booking.rideId);
                        return (
                          <Card key={booking.id} className={`p-4 ${booking.status === 'cancelled' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                  {relatedRide?.rideId || 'RB-PENDING'}
                                </Badge>
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}</span>
                                  <Badge variant={booking.status === 'completed' ? 'secondary' : 'destructive'}>
                                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {relatedRide?.departureDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>({formatDateToDDMMYYYY(relatedRide.departureDate)})</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{relatedRide?.departureTime}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{booking.seatsBooked} seats</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[22px] font-bold text-gray-600 mb-2">
                                  £{booking.totalCost}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bookings.filter(booking => booking.riderId === user?.id && (booking.status === 'completed' || booking.status === 'cancelled')).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No past rides yet.</p>
                          <p className="text-sm">Completed and cancelled rides will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {activeTab === 'requests' && !showProfileEdit && (
          <div className="space-y-6">
            {userType === 'driver' ? (
              // Drivers see ride requests from riders
              <div className="space-y-4">
                {/* Unified Request Cards - Both Ride Requests and Booking Requests */}
                
                {/* Ride Requests from Riders */}
                {rideRequests.filter((request: any) => request.status === 'active').map((request: any) => (
                  <Card key={`request-${request.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Badge variant="outline" className="text-blue-600 border-blue-300 mb-2">
                            Ride Request
                          </Badge>
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{request.fromLocation} → {request.toLocation}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateToDDMMYYYY(request.departureDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{request.departureTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{request.passengers} passenger{request.passengers > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          {request.notes && (
                            <p className="text-sm text-gray-600 italic">"{request.notes}"</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-[22px] font-bold text-green-600 mb-2">
                            £{request.maxPrice}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">Rider's Budget</div>
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm"
                              onClick={() => handleConfirmRideRequest(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm Ride
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleCounterOffer(request)}
                            >
                              Counter Offer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Booking Requests for Posted Rides */}
                {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending' && booking.rideId && !booking.rideRequestId).map((booking: any) => {
                  const relatedRide = rides.find(r => r.id === booking.rideId);
                  return (
                    <Card key={`booking-${booking.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200 mb-2">
                              {relatedRide?.rideId || booking.jobId}
                            </Badge>
                            <Badge variant="outline" className="text-green-600 border-green-300 mb-2 ml-2">
                              Booking Request
                            </Badge>
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {relatedRide?.fromLocation || 'Not specified'} → {relatedRide?.toLocation || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              {relatedRide?.departureDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDateToDDMMYYYY(relatedRide.departureDate)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{relatedRide?.departureTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{booking.seatsBooked} passenger{booking.seatsBooked > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            {booking.message && (
                              <p className="text-sm text-gray-600 italic">"{booking.message}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-[22px] font-bold text-green-600 mb-2">
                              £{booking.totalCost}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">Your Posted Price</div>
                            <div className="flex flex-col space-y-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm Booking
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCounterOfferBooking(booking)}
                              >
                                Counter Offer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Empty State */}
                {rideRequests.filter((request: any) => request.status === 'active').length === 0 && 
                 bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending' && booking.rideId && !booking.rideRequestId).length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ride requests</h3>
                    <p className="text-gray-500">
                      Ride requests from passengers will appear here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Riders see available rides from drivers (next 60 days)
              <div className="space-y-4">
                {rides.filter((ride: any) => {
                  // Don't show user's own rides (except for test user)
                  if (ride.driverId === user?.id && user?.email !== 'coolsami_uk@yahoo.com') {
                    return false;
                  }
                  
                  // Show all recurring rides as they are ongoing
                  if (ride.isRecurring === 'true' || ride.isRecurring === true) {
                    return true;
                  }
                  
                  // Skip rides without departure dates that aren't recurring
                  if (!ride.departureDate || ride.departureDate === '') {
                    return false;
                  }
                  
                  // Check date range for non-recurring rides
                  const today = new Date();
                  const rideDate = new Date(ride.departureDate);
                  const maxDate = new Date();
                  maxDate.setDate(today.getDate() + 60);
                  
                  return rideDate >= today && rideDate <= maxDate;
                }).map((ride: any) => (
                  <Card key={ride.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{ride.fromLocation} → {ride.toLocation}</span>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            Available
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{ride.departureDate || (ride.isRecurring === 'true' ? 'Recurring' : 'Date TBD')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{ride.departureTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{ride.availableSeats} seats available</span>
                          </div>
                        </div>
                        {ride.vehicleInfo && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Vehicle:</strong> {ride.vehicleInfo}
                          </p>
                        )}
                        {ride.notes && (
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {ride.notes}
                          </p>
                        )}
                        {ride.isRecurring === 'true' && (
                          <div className="text-sm text-blue-600 font-medium">
                            <strong>Recurring:</strong> {ride.recurringData ? JSON.parse(ride.recurringData).frequency : 'Regular schedule'}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[22px] font-bold text-green-600 mb-2">
                          £{ride.price}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedRide(ride);
                            setShowBookingModal(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Book Ride
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {rides.filter((ride: any) => {
                  // Filter logic same as above for consistency
                  if (ride.driverId === user?.id && user?.email !== 'coolsami_uk@yahoo.com') return false;
                  
                  if (ride.isRecurring === 'true' || ride.isRecurring === true) {
                    return true;
                  }
                  
                  if (!ride.departureDate || ride.departureDate === '') {
                    return false;
                  }
                  
                  const today = new Date();
                  const rideDate = new Date(ride.departureDate);
                  const maxDate = new Date();
                  maxDate.setDate(today.getDate() + 60);
                  
                  return rideDate >= today && rideDate <= maxDate;
                }).length === 0 && (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
                    <p className="text-gray-500 mb-1">
                      No rides found for the next 60 days
                    </p>
                    <p className="text-sm text-gray-400">
                      Rides posted by drivers will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showBookingModal && selectedRide && (
          <BookRideModal 
            ride={selectedRide}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedRide(null);
            }}
            onBookingComplete={() => {
              setShowBookingModal(false);
              setSelectedRide(null);
              fetchData();
            }}
          />
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Messages</h2>
              <Badge variant="outline" className="text-blue-600">
                {conversations.reduce((total: number, conv: any) => total + conv.unreadCount, 0)} unread
              </Badge>
            </div>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500 mb-1">
                  Your conversations with other users will appear here
                </p>
                <p className="text-sm text-gray-400">
                  Complete a trip booking to start messaging
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation: any) => {
                  // Get partner details from booking
                  const ride = rides.find((r: any) => r.id === conversation.booking.rideId);
                  const partnerName = conversation.partnerType === 'driver' 
                    ? `Driver` 
                    : `Rider`;
                  
                  return (
                    <Card key={conversation.partnerId} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedBooking(conversation.booking);
                            setShowChatPopup(true);
                            fetchConversations(); // Refresh to update unread counts
                          }}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          
                          {/* Conversation Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {partnerName}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {conversation.partnerType}
                                </Badge>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(conversation.lastMessage.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            {/* Trip Details */}
                            <div className="flex items-center space-x-2 mb-2 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {ride?.fromLocation || 'Trip'} → {ride?.toLocation || 'Destination'}
                              </span>
                              {ride?.rideId && (
                                <Badge variant="outline" className="text-xs font-mono">
                                  {ride.rideId}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Last Message Preview */}
                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
                              {conversation.lastMessage.message}
                            </p>
                          </div>
                          
                          {/* Chat Icon */}
                          <div className="flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Popup */}
        {showChatPopup && selectedBooking && (
          <ChatPopup
            isOpen={showChatPopup}
            onClose={() => setShowChatPopup(false)}
            booking={selectedBooking}
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* Counter Offer Modal */}
        {showCounterOfferModal && selectedRequest && (
          <CounterOfferModal
            isOpen={showCounterOfferModal}
            onClose={() => {
              setShowCounterOfferModal(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onCounterOfferSubmit={handleCounterOfferSubmit}
          />
        )}

        {/* Modify Ride Modal */}
        {showModifyRideModal && selectedRideToModify && (
          <ModifyRideModal
            ride={selectedRideToModify}
            onClose={() => {
              setShowModifyRideModal(false);
              setSelectedRideToModify(null);
            }}
            onRideModified={() => {
              fetchData();
              setShowModifyRideModal(false);
              setSelectedRideToModify(null);
            }}
          />
        )}

        {/* Post New Ride Modal */}
        {showPostRideForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Post New Ride</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPostRideForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <PostNewRideForm 
                  onClose={() => {
                    setShowPostRideForm(false);
                    fetchData();
                  }}
                  savedData={getSavedFormData()}
                  onDataChange={handleFormDataSave}
                />
              </div>
            </div>
          </div>
        )}

        {/* Request New Ride Modal */}
        {showRideRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Request New Ride</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRideRequestForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <NewRideRequestForm 
                  onClose={() => {
                    setShowRideRequestForm(false);
                    fetchData();
                  }}
                  savedData={getSavedFormData()}
                  onDataChange={handleFormDataSave}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
