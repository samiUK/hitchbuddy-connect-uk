
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
  PoundSterling
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuthNew";
import { NewRideRequestForm } from "@/components/NewRideRequestForm";
import { PostNewRideForm } from "@/components/PostNewRideForm";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { BookRideModal } from "@/components/BookRideModal";
import { ChatPopup } from "@/components/ChatPopup";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'post' | 'rides' | 'requests'>('overview');
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
  
  const userType = user?.userType || 'rider';
  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';

  // Calculate profile completeness
  const calculateProfileCompleteness = () => {
    if (!user) return { score: 0, total: 0, missing: [] };
    
    const requiredFields = [
      { field: 'firstName', label: 'First Name', value: user.firstName },
      { field: 'lastName', label: 'Last Name', value: user.lastName },
      { field: 'email', label: 'Email', value: user.email },
      { field: 'phone', label: 'Phone Number', value: user.phone },
      { field: 'address', label: 'Address', value: user.address },
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
    }
  }, [user, userType]);

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
        }
      }

      // Fetch bookings for all users
      const bookingsResponse = await fetch('/api/bookings', {
        credentials: 'include'
      });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
        
        // Create notifications for drivers about new ride requests
        if (userType === 'driver') {
          const pendingBookings = bookingsData.bookings.filter(b => 
            b.status === 'pending' && b.driverId === user?.id
          );
          setNotifications(pendingBookings.map(booking => ({
            id: booking.id,
            type: 'booking_request',
            message: `New ride request from rider`,
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

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
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
          title: action === 'confirmed' ? "Booking confirmed!" : "Booking declined",
          description: action === 'confirmed' 
            ? "The rider has been notified and can now contact you."
            : "The booking has been declined.",
        });
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
            riderName: `${riderData.user.firstName} ${riderData.user.lastName}`,
            riderAvatar: riderData.user.avatarUrl
          };
        }
      } catch (error) {
        console.error('Error fetching rider details:', error);
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
            driverName: `${driverData.user.firstName} ${driverData.user.lastName}`,
            driverAvatar: driverData.user.avatarUrl
          };
        }
      } catch (error) {
        console.error('Error fetching driver details:', error);
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
                      onError={() => console.log('Header avatar failed to load:', user?.avatarUrl)}
                      onLoad={() => console.log('Header avatar loaded successfully:', user?.avatarUrl)}
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
        {notifications.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">Quick Actions</CardTitle>
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
                      onClick={() => setActiveTab('rides')}
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
            { id: 'requests', label: userType === 'driver' ? 'Find Requests' : 'My Bookings', icon: Car },
            { id: 'rides', label: userType === 'driver' ? 'My Rides & Bookings' : 'Find Rides', icon: userType === 'driver' ? Car : Search },
            { id: 'post', label: userType === 'driver' ? 'Post New Ride' : 'Request a Ride', icon: Calendar }
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
                    <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userType === 'driver' ? rides.filter(r => r.driverId === user?.id).length : rides.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {userType === 'driver' ? 'Rides you\'ve posted' : 'Available rides'}
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
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{notifications.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {userType === 'driver' ? 'New ride requests' : 'Updates'}
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

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowProfileEdit(true)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Completion</CardTitle>
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

                    {/* Missing Fields */}
                    {profileCompleteness.missing.length > 0 && (
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

                    {/* Complete Button */}
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

        {activeTab === 'post' && !showProfileEdit && (
          <div className="space-y-6">
            <div className="max-w-2xl">
              {userType === 'driver' ? (
                <PostNewRideForm 
                  onClose={() => {
                    clearSavedFormData();
                    setActiveTab('overview');
                    fetchData();
                  }}
                  savedData={getSavedFormData()}
                  onDataChange={handleFormDataSave}
                />
              ) : (
                <NewRideRequestForm 
                  onClose={() => {
                    clearSavedFormData();
                    setActiveTab('overview');
                    fetchData();
                  }}
                  savedData={getSavedFormData()}
                  onDataChange={handleFormDataSave}
                />
              )}
            </div>
          </div>
        )}

        {/* Profile Edit Form */}
        {showProfileEdit && (
          <ProfileEditForm onClose={() => setShowProfileEdit(false)} />
        )}

        {activeTab === 'rides' && !showProfileEdit && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {userType === 'driver' ? 'My Rides & Bookings' : 'Available Rides'}
            </h2>
            
            <div className="grid gap-6">
              {userType === 'driver' ? (
                <div className="space-y-6">
                  {/* Booking Requests Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Requests</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending').map((booking: any) => {
                    const relatedRide = rides.find(r => r.id === booking.rideId);
                    return (
                      <Card key={booking.id} className={`p-4 ${booking.status === 'pending' ? 'border-orange-300 bg-orange-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{relatedRide?.fromLocation} → {relatedRide?.toLocation}</span>
                              <Badge variant={booking.status === 'pending' ? 'destructive' : 'default'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              {relatedRide?.departureDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{relatedRide.departureDate}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{relatedRide?.departureTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{booking.seatsBooked} seats requested</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p><strong>Phone:</strong> {booking.phoneNumber}</p>
                              {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600 mb-2">
                              £{booking.totalCost}
                            </div>
                            {booking.status === 'pending' ? (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                >
                                  Decline
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMessageRider(booking)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message Rider
                              </Button>
                            )}
                          </div>
                        </div>
                        </Card>
                      );
                    })}
                    {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'pending').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No pending booking requests.</p>
                        <p className="text-sm">New requests will appear here.</p>
                      </div>
                    )}
                    </div>
                  </div>

                  {/* My Upcoming Rides Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">My Upcoming Rides</h3>
                    <div className="space-y-4">
                      {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'confirmed').map((booking: any) => {
                        const relatedRide = rides.find(r => r.id === booking.rideId);
                        return (
                          <Card key={booking.id} className="p-4 border-green-300 bg-green-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{relatedRide?.fromLocation} → {relatedRide?.toLocation}</span>
                                  <Badge variant="default" className="bg-green-600">
                                    Confirmed
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {relatedRide?.departureDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{relatedRide.departureDate}</span>
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
                                <div className="text-lg font-bold text-green-600 mb-2">
                                  £{booking.totalCost}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMessageRider(booking)}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Start Chat
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                      {bookings.filter(booking => booking.driverId === user?.id && booking.status === 'confirmed').length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No confirmed rides yet.</p>
                          <p className="text-sm">Confirmed bookings will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Riders see available rides
                rides.map((ride: any) => (
                  <Card key={ride.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
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
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{ride.departureDate || 'Not specified'} at {ride.departureTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{ride.availableSeats} seats available</span>
                            </div>
                            {ride.isRecurring === 'true' && (
                              <Badge variant="outline">Recurring</Badge>
                            )}
                          </div>
                          {ride.notes && (
                            <p className="text-sm text-gray-600 mt-1">{ride.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">£{ride.price}</p>
                            <p className="text-sm text-gray-500">per seat</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowBookingModal(true);
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}



        {activeTab === 'requests' && !showProfileEdit && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {userType === 'driver' ? 'Find Ride Requests' : 'My Bookings'}
            </h2>

            {userType === 'driver' ? (
              // Drivers see ride requests from riders
              <div className="space-y-4">
                {rideRequests.map((request: any) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{request.fromLocation}</span>
                            </div>
                            <span className="text-gray-400">→</span>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span className="font-medium">{request.toLocation}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{request.departureDate || 'Flexible'} at {request.departureTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{request.passengers} passenger{request.passengers !== '1' ? 's' : ''}</span>
                            </div>
                            {request.maxPrice && (
                              <div className="flex items-center space-x-1">
                                <Car className="h-4 w-4" />
                                <span>Up to £{request.maxPrice}</span>
                              </div>
                            )}
                          </div>
                          {request.notes && (
                            <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Feature coming soon",
                                description: "Direct messaging with riders will be available soon.",
                              });
                            }}
                          >
                            Contact Rider
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {rideRequests.length === 0 && (
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
              // Riders see their bookings (confirmed and past)
              <div className="space-y-8">
                {/* Upcoming Bookings Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Rides</h3>
                  <div className="space-y-4">
                    {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'confirmed').map((booking: any) => {
                      const relatedRide = rides.find(r => r.id === booking.rideId);
                      return (
                        <Card key={booking.id} className="p-4 border-green-300 bg-green-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{relatedRide?.fromLocation} → {relatedRide?.toLocation}</span>
                                <Badge variant="default" className="bg-green-600">
                                  Confirmed
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                {relatedRide?.departureDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{relatedRide.departureDate}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{relatedRide?.departureTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p><strong>Driver:</strong> Contact through chat</p>
                                {booking.message && <p><strong>Your Message:</strong> {booking.message}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600 mb-2">
                                £{booking.totalCost}
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleMessageRider(booking)}
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Message Driver
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'confirmed').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming rides.</p>
                        <p className="text-sm">Your confirmed bookings will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Past Bookings Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Rides</h3>
                  <div className="space-y-4">
                    {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'completed').map((booking: any) => {
                      const relatedRide = rides.find(r => r.id === booking.rideId);
                      return (
                        <Card key={booking.id} className="p-4 border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{relatedRide?.fromLocation} → {relatedRide?.toLocation}</span>
                                <Badge variant="secondary">
                                  Completed
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                {relatedRide?.departureDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{relatedRide.departureDate}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{relatedRide?.departureTime}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-600 mb-2">
                                £{booking.totalCost}
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled
                              >
                                Trip Completed
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                    {bookings.filter(booking => booking.riderId === user?.id && booking.status === 'completed').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No past rides.</p>
                        <p className="text-sm">Completed rides will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
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
              fetchData();
            }}
          />
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500">
                Your conversations with other users will appear here
              </p>
            </div>
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Upcoming Rides</h2>
            <div className="grid gap-4">
              {bookings.filter(booking => booking.status === 'confirmed').map((booking: any) => {
                const relatedRide = rides.find(r => r.id === booking.rideId);
                const isDriver = booking.driverId === user?.id;
                return (
                  <Card key={booking.id} className="p-4 border-green-300 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{relatedRide?.fromLocation} → {relatedRide?.toLocation}</span>
                          <Badge variant="default" className="bg-green-600">
                            Confirmed
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          {relatedRide?.departureDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{relatedRide.departureDate}</span>
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
                          <p><strong>{isDriver ? 'Rider' : 'Driver'} Phone:</strong> {booking.phoneNumber}</p>
                          {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 mb-2">
                          £{booking.totalCost}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMessageRider(booking)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Start Chat
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {bookings.filter(booking => booking.status === 'confirmed').length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed rides yet</h3>
                  <p className="text-gray-500">
                    Your confirmed rides will appear here
                  </p>
                </div>
              )}
            </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
