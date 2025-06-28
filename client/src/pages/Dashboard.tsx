import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthNew';
import { Car, MapPin, Clock, User, CircleDollarSign, MessageSquare, Star, Calendar, Search, MessageCircle, Plus } from 'lucide-react';
import { PostNewRideForm } from '@/components/PostNewRideForm';
import { NewRideRequestForm } from '@/components/NewRideRequestForm';
import { BookRideModal } from '@/components/BookRideModal';
import { ChatPopup } from '@/components/ChatPopup';
import { ModifyRideModal } from '@/components/ModifyRideModal';
import { CounterOfferModal } from '@/components/CounterOfferModal';
import { RatingModal } from '@/components/RatingModal';
import { ProfileEditForm } from '@/components/ProfileEditForm';
import { formatDateToDDMMYYYY, formatDateWithRecurring } from '@/lib/dateUtils';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quickActionsDismissed, setQuickActionsDismissed] = useState(false);
  const [showPostRideForm, setShowPostRideForm] = useState(false);
  const [showRideRequestForm, setShowRideRequestForm] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModifyRideModal, setShowModifyRideModal] = useState(false);
  const [selectedRideForModification, setSelectedRideForModification] = useState(null);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const userType = user?.userType;

  // Profile completeness calculation
  const profileCompleteness = user ? {
    percentage: user.city ? 100 : 80,
    missingFields: user.city ? [] : ['city']
  } : { percentage: 0, missingFields: [] };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (userType === 'driver') {
        // Fetch driver's rides
        const myRidesResponse = await fetch('/api/rides/my', {
          credentials: 'include',
        });
        if (myRidesResponse.ok) {
          const data = await myRidesResponse.json();
          setRides(data.rides || []);
        }
      } else {
        // Fetch available rides for riders
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
      }

      // Fetch all messages grouped by booking for inbox functionality
      const messagesResponse = await fetch('/api/messages/all', {
        credentials: 'include'
      });
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setAllMessages(messagesData.messageThreads || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const getSavedFormData = (formType: 'postRide' | 'rideRequest') => {
    const key = `hitchbuddy_${formType}_data`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      // Check if data is older than 5 minutes
      if (Date.now() - data.timestamp < 5 * 60 * 1000) {
        return data.formData;
      } else {
        localStorage.removeItem(key);
      }
    }
    return null;
  };

  const handleFormDataSave = (formType: 'postRide' | 'rideRequest', data: any) => {
    const key = `hitchbuddy_${formType}_data`;
    localStorage.setItem(key, JSON.stringify({
      formData: data,
      timestamp: Date.now()
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">
                {userType === 'driver' ? 'Driver' : 'Rider'} Dashboard
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowProfileForm(true)}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            Edit Profile
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="rides-bookings" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>My Rides & Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="find-requests" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>{userType === 'driver' ? 'Find Requests' : 'Available Rides'}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>My Messages</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Car className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {userType === 'driver' ? 'Live Rides' : 'Live Requests'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {userType === 'driver' 
                          ? rides.filter(r => r.driverId === user?.id && r.status === 'active' && !r.notes?.includes('Counter offer')).length
                          : rideRequests.filter(r => r.riderId === user?.id && r.status === 'active').length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <User className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Requests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(booking => booking.status === 'pending' && 
                          (booking.driverId === user?.id || booking.riderId === user?.id)).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Rides</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter(booking => booking.status === 'completed' && 
                          (booking.driverId === user?.id || booking.riderId === user?.id)).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CircleDollarSign className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                      <p className="text-2xl font-bold text-gray-900">{profileCompleteness?.percentage || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Messages</h2>
              <Badge variant="outline" className="text-blue-600">
                {allMessages.filter((thread: any) => thread.unreadCount > 0).length} unread conversations
              </Badge>
            </div>

            {allMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500">
                  Your conversations with other users will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allMessages.map((thread: any) => {
                  const otherUserType = thread.booking.driverId === user?.id ? 'rider' : 'driver';
                  const isCompleted = thread.booking.status === 'completed' || thread.booking.status === 'cancelled';
                  
                  return (
                    <Card 
                      key={thread.booking.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        thread.unreadCount > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedBooking(thread.booking);
                        setShowChatPopup(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* User Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {thread.otherUser?.firstName?.[0]}{thread.otherUser?.lastName?.[0]}
                            </div>
                            
                            {/* Message Details */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {thread.otherUser?.firstName} {thread.otherUser?.lastName}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {otherUserType === 'driver' ? 'Driver' : 'Rider'}
                                </Badge>
                                {thread.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {thread.unreadCount} new
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Ride Details */}
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span>{thread.ride?.fromLocation} → {thread.ride?.toLocation}</span>
                                {thread.ride?.rideId && (
                                  <Badge variant="outline" className="text-xs">
                                    {thread.ride.rideId}
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Last Message Preview */}
                              <p className="text-sm text-gray-700 line-clamp-2">
                                <span className="font-medium">
                                  {thread.lastMessage.senderId === user?.id ? 'You: ' : ''}
                                </span>
                                {thread.lastMessage.message}
                              </p>
                              
                              {/* Timestamp */}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(thread.lastMessage.createdAt).toLocaleDateString()} at{' '}
                                {new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="flex flex-col items-end space-y-2">
                            {!isCompleted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(thread.booking);
                                  setShowChatPopup(true);
                                }}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                            )}
                            
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateToDDMMYYYY(thread.ride?.departureDate)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Other tabs content would go here */}
          <TabsContent value="rides-bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Rides & Bookings</h2>
              <div className="flex space-x-2">
                {userType === 'driver' ? (
                  <Button 
                    onClick={() => setShowPostRideForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Ride
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowRideRequestForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request New Ride
                  </Button>
                )}
              </div>
            </div>
            
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content loading...</h3>
              <p className="text-gray-500">
                Ride management functionality will appear here
              </p>
            </div>
          </TabsContent>

          <TabsContent value="find-requests" className="space-y-6">
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Find Requests</h3>
              <p className="text-gray-500">
                {userType === 'driver' ? 'Ride requests from riders' : 'Available rides from drivers'} will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showPostRideForm && (
          <PostNewRideForm 
            onClose={() => setShowPostRideForm(false)}
            savedData={getSavedFormData('postRide')}
            onDataChange={(data) => handleFormDataSave('postRide', data)}
          />
        )}

        {showRideRequestForm && (
          <NewRideRequestForm
            onClose={() => setShowRideRequestForm(false)}
            savedData={getSavedFormData('rideRequest')}
            onDataChange={(data) => handleFormDataSave('rideRequest', data)}
          />
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

        {showChatPopup && selectedBooking && (
          <ChatPopup 
            isOpen={showChatPopup}
            onClose={() => setShowChatPopup(false)}
            booking={selectedBooking}
            currentUser={user}
            onSendMessage={(message) => {
              // Message sending implementation
              fetchData();
            }}
          />
        )}

        {showProfileForm && (
          <ProfileEditForm onClose={() => setShowProfileForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;