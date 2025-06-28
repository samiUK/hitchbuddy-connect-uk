import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  CircleDollarSign,
  MessageSquare
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
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quickActionsDismissed, setQuickActionsDismissed] = useState(false);
  const [showModifyRideModal, setShowModifyRideModal] = useState(false);
  const [selectedRideToModify, setSelectedRideToModify] = useState<any>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratedUser, setRatedUser] = useState<any>(null);
  
  const userType = user?.userType || 'rider';

  // Navigation handler for notifications
  const handleNotificationNavigation = (section: string) => {
    const validTabs = ['overview', 'post', 'rides', 'requests'] as const;
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
    ];
    
    const completed = requiredFields.filter(field => field.value && field.value.trim() !== '');
    const missing = requiredFields.filter(field => !field.value || field.value.trim() === '').map(field => field.label);
    
    return {
      score: completed.length,
      total: requiredFields.length,
      missing,
      percentage: Math.round((completed.length / requiredFields.length) * 100)
    };
  };

  const profileCompleteness = calculateProfileCompleteness();

  // Handle user type switching
  const handleUserTypeToggle = async (newUserType: 'rider' | 'driver') => {
    if (!user || isUpdatingUserType) return;
    
    setIsUpdatingUserType(true);
    try {
      const result = await updateProfile({ userType: newUserType });
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Switched to ${newUserType} mode`,
        });
        // Refresh data after user type change
        fetchData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user type",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingUserType(false);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchRides(),
        fetchRideRequests(), 
        fetchBookings(),
        fetchNotifications()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRides(data.rides || []);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const fetchRideRequests = async () => {
    try {
      const response = await fetch('/api/ride-requests', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRideRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };



  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Auto-refresh notifications every 5 minutes
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Calculate stats
  const calculateStats = () => {
    if (!Array.isArray(rides) || !Array.isArray(rideRequests) || !Array.isArray(bookings) || !Array.isArray(notifications)) {
      return {
        activeRequests: 0,
        completedRides: 0,
        notifications: 0,
        liveRides: 0
      };
    }

    const unreadNotifications = notifications.filter((n: any) => !n.isRead);
    const completedBookings = bookings.filter((b: any) => b.status === 'completed');

    if (userType === 'driver') {
      const myRides = rides.filter((r: any) => r.driverId === user?.id);
      const publicRides = myRides.filter((r: any) => !r.notes?.includes('Counter offer for'));
      
      return {
        activeRequests: 0,
        completedRides: completedBookings.length,
        notifications: unreadNotifications.length,
        liveRides: publicRides.length
      };
    } else {
      const myRequests = rideRequests.filter((r: any) => r.riderId === user?.id && r.status === 'active');
      
      return {
        activeRequests: myRequests.length,
        completedRides: completedBookings.length, 
        notifications: unreadNotifications.length,
        liveRides: 0
      };
    }
  };

  const stats = calculateStats();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <BetaDisclaimer />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{firstName[0]}{lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Welcome back, {firstName}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.city && `${user.city} • `}{user.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Type Switch */}
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                <span className={`text-sm font-medium ${userType === 'rider' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  Rider
                </span>
                <Switch
                  checked={userType === 'driver'}
                  onCheckedChange={(checked) => handleUserTypeToggle(checked ? 'driver' : 'rider')}
                  disabled={isUpdatingUserType}
                />
                <span className={`text-sm font-medium ${userType === 'driver' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  Driver
                </span>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileEdit(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rides" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              My Rides & Bookings
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {userType === 'driver' ? 'Find Requests' : 'Available Rides'}
            </TabsTrigger>
            <TabsTrigger value="post" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {userType === 'driver' ? 'Post New Ride' : 'Request New Ride'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {userType === 'driver' ? 'Live Rides' : 'Active Requests'}
                  </CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userType === 'driver' ? stats.liveRides : stats.activeRequests}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedRides}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.notifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Complete</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profileCompleteness.percentage}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completeness */}
            {profileCompleteness && profileCompleteness.percentage < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Complete Your Profile
                  </CardTitle>
                  <CardDescription>
                    Your profile is {profileCompleteness.percentage}% complete. Complete it to get better matches.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{profileCompleteness.score}/{profileCompleteness.total} fields completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${profileCompleteness.percentage}%` }}
                      />
                    </div>
                    {profileCompleteness.missing.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Missing: {profileCompleteness.missing.join(', ')}
                      </div>
                    )}
                    <Button onClick={() => setShowProfileEdit(true)} variant="outline" size="sm">
                      Complete Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications */}
            <NotificationCenter onNavigate={handleNotificationNavigation} />
          </TabsContent>

          {/* My Rides & Bookings Tab */}
          <TabsContent value="rides" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Rides & Bookings</h2>
              <Button onClick={() => setActiveTab(userType === 'driver' ? 'post' : 'post')}>
                <Plus className="h-4 w-4 mr-2" />
                {userType === 'driver' ? 'Post New Ride' : 'Request New Ride'}
              </Button>
            </div>

            {/* Content based on user type */}
            {userType === 'driver' ? (
              <div className="space-y-6">
                {/* My Posted Rides */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">My Posted Rides</h3>
                  <div className="grid gap-4">
                    {rides.filter((ride: any) => ride.driverId === user.id && !ride.notes?.includes('Counter offer for')).map((ride: any) => (
                      <Card key={ride.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2">{ride.id}</Badge>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{ride.fromLocation} → {ride.toLocation}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDateWithRecurring(ride.departureDate, ride.isRecurring)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {ride.departureTime}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {ride.availableSeats} seats
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-2xl font-bold text-green-600">£{ride.price}</div>
                              <div className="space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRideToModify(ride);
                                    setShowModifyRideModal(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCancelRide(ride.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Booking Requests */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Requests</h3>
                  <div className="grid gap-4">
                    {bookings.filter((booking: any) => booking.driverId === user.id && booking.status === 'pending').map((booking: any) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          {/* Booking request content */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* My Live Requests */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">My Live Requests</h3>
                  <div className="grid gap-4">
                    {rideRequests.filter((request: any) => request.riderId === user.id && request.status === 'active').map((request: any) => (
                      <Card key={request.id}>
                        <CardContent className="p-4">
                          {/* Request content */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Upcoming Rides */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Rides</h3>
                  <div className="grid gap-4">
                    {bookings.filter((booking: any) => booking.riderId === user.id && booking.status === 'confirmed').map((booking: any) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          {/* Booking content */}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Find Requests/Available Rides Tab */}
          <TabsContent value="requests" className="space-y-6">
            <h2 className="text-2xl font-bold">
              {userType === 'driver' ? 'Find Requests' : 'Available Rides'}
            </h2>
            {/* Content for find requests/available rides */}
          </TabsContent>



          {/* Post New Ride/Request Tab */}
          <TabsContent value="post">
            {userType === 'driver' ? (
              <PostNewRideForm 
                onClose={() => setActiveTab('overview')}
                savedData={savedFormData}
                onDataChange={setSavedFormData}
              />
            ) : (
              <NewRideRequestForm 
                onClose={() => setActiveTab('overview')}
                savedData={savedFormData}
                onDataChange={setSavedFormData}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showProfileEdit && (
        <ProfileEditForm onClose={() => setShowProfileEdit(false)} />
      )}

      {showBookingModal && selectedRide && (
        <BookRideModal
          ride={selectedRide}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRide(null);
          }}
          onBookingComplete={fetchData}
        />
      )}

      {showChatPopup && selectedBooking && (
        <ChatPopup
          isOpen={showChatPopup}
          onClose={() => {
            setShowChatPopup(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          currentUser={user}
          onSendMessage={() => {}}
        />
      )}

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

      {showModifyRideModal && selectedRideToModify && (
        <ModifyRideModal
          ride={selectedRideToModify}
          onClose={() => {
            setShowModifyRideModal(false);
            setSelectedRideToModify(null);
          }}
          onRideModified={fetchData}
        />
      )}

      {showRatingModal && ratedUser && selectedBooking && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setRatedUser(null);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          ratedUser={ratedUser}
        />
      )}
    </div>
  );

  // Helper functions
  async function handleCounterOfferSubmit(requestId: string, offerPrice: number, message: string) {
    try {
      const response = await fetch('/api/counter-offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          requestId,
          offerPrice,
          message,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Counter offer sent successfully",
        });
        setShowCounterOfferModal(false);
        setSelectedRequest(null);
        fetchData();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send counter offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send counter offer",
        variant: "destructive",
      });
    }
  }

  async function handleCancelRide(rideId: string) {
    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Ride cancelled successfully",
        });
        fetchData();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to cancel ride",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel ride",
        variant: "destructive",
      });
    }
  }
};

export default Dashboard;