
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Car, 
  User, 
  MapPin, 
  Clock, 
  Star, 
  Plus,
  Search,
  MessageCircle,
  Settings,
  LogOut,
  Navigation
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NewRideRequestForm } from "@/components/NewRideRequestForm";
import { PostNewRideForm } from "@/components/PostNewRideForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'rides' | 'messages'>('overview');
  const [showRideRequestForm, setShowRideRequestForm] = useState(false);
  const [showPostRideForm, setShowPostRideForm] = useState(false);
  const [isUpdatingUserType, setIsUpdatingUserType] = useState(false);
  
  const userType = user?.user_metadata?.user_type || 'rider';
  const firstName = user?.user_metadata?.first_name || '';
  const lastName = user?.user_metadata?.last_name || '';

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUserTypeSwitch = async (isDriver: boolean) => {
    if (isUpdatingUserType) return;
    
    setIsUpdatingUserType(true);
    const newUserType = isDriver ? 'driver' : 'rider';
    
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { user_type: newUserType }
      });

      if (authError) throw authError;

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: newUserType })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Account type updated",
        description: `You are now a ${newUserType}`,
      });

      // Refresh the page to update the UI
      window.location.reload();
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
                {/* User Type Switcher */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Rider</span>
                  </div>
                  <Switch
                    checked={userType === 'driver'}
                    onCheckedChange={handleUserTypeSwitch}
                    disabled={isUpdatingUserType}
                  />
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Driver</span>
                  </div>
                </div>

                {/* User Profile Info */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    {userType === 'driver' ? (
                      <Car className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {firstName} {lastName}
                  </span>
                  <Badge variant={userType === 'driver' ? 'default' : 'secondary'}>
                    {userType}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-gray-600">
            {userType === 'driver' 
              ? 'Manage your rides and connect with passengers' 
              : 'Find your next ride and book with trusted drivers'
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Navigation },
            { id: 'rides', label: userType === 'driver' ? 'My Rides' : 'Find Rides', icon: Car },
            { id: 'messages', label: 'Messages', icon: MessageCircle }
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
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    {userType === 'driver' 
                      ? 'Manage your driving schedule and rides'
                      : 'Find and book your next journey'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {userType === 'driver' ? (
                      <>
                        <Button 
                          className="h-24 flex-col space-y-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          onClick={() => setShowPostRideForm(true)}
                        >
                          <Plus className="h-6 w-6" />
                          <span>Post New Ride</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col space-y-2">
                          <Car className="h-6 w-6" />
                          <span>Manage Vehicle</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="h-24 flex-col space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                          <Search className="h-6 w-6" />
                          <span>Find a Ride</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col space-y-2">
                          <Clock className="h-6 w-6" />
                          <span>My Bookings</span>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-semibold">New User</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {userType === 'driver' ? 'Earnings' : 'Money Saved'}
                      </span>
                      <span className="font-semibold">£0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Profile Info</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Phone Verification</span>
                      <span className="text-gray-400">○</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Profile Photo</span>
                      <span className="text-gray-400">○</span>
                    </div>
                    {userType === 'driver' && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Vehicle Details</span>
                        <span className="text-gray-400">○</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">25% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'rides' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {userType === 'driver' ? 'My Rides' : 'Available Rides'}
              </h2>
              {userType === 'driver' && (
                <Button 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={() => setShowPostRideForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Ride
                </Button>
              )}
            </div>
            
            {showRideRequestForm ? (
              <NewRideRequestForm onClose={() => setShowRideRequestForm(false)} />
            ) : showPostRideForm ? (
              <PostNewRideForm onClose={() => setShowPostRideForm(false)} />
            ) : (
              <div className="text-center py-12">
                <Car className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {userType === 'driver' ? 'No rides posted yet' : 'No rides available nearby'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {userType === 'driver' 
                    ? 'Start earning by posting your first ride'
                    : 'No drivers are offering rides in your area right now'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (userType === 'driver') {
                        setShowPostRideForm(true);
                      } else {
                        setShowRideRequestForm(true);
                      }
                    }}
                  >
                    {userType === 'driver' ? 'Post Your First Ride' : 'Create Ride Request'}
                  </Button>
                  {userType === 'rider' && (
                    <Button variant="outline">
                      Set Up Ride Alerts
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
