
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, MessageCircle, Star, Car, User, LogOut } from "lucide-react";
import { LandingHero } from "@/components/LandingHero";
import { UserTypeSelection } from "@/components/UserTypeSelection";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [userType, setUserType] = useState<'rider' | 'driver' | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleUserTypeSelect = (type: 'rider' | 'driver') => {
    if (user) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      setUserType(type);
      navigate('/auth');
    }
  };

  const handleGetStarted = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Smart Route Matching",
      description: "AI-powered matching connects you with rides along your exact route"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Trusted Community",
      description: "Verified profiles and ratings ensure safe, reliable journey partners"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
      title: "Secure Messaging",
      description: "Coordinate your journey with built-in chat before you travel"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Fair Pricing",
      description: "AI suggests fair fares based on distance, demand, and market rates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
            <div className="flex space-x-4 items-center">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.user_metadata?.first_name || user.email}
                  </span>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth')}>
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero onGetStarted={handleGetStarted} />

      {/* User Type Selection */}
      <UserTypeSelection onUserTypeSelect={handleUserTypeSelect} />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Hitchbuddy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of UK travelers saving money and making connections through shared rides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Successful Rides</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">£2M+</div>
              <div className="text-blue-100">Money Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the UK's most trusted ride-sharing community today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8"
              onClick={() => handleUserTypeSelect('rider')}
            >
              <User className="mr-2 h-5 w-5" />
              I Need a Ride
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
              onClick={() => handleUserTypeSelect('driver')}
            >
              <Car className="mr-2 h-5 w-5" />
              I'm a Driver
            </Button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        userType={userType}
      />
    </div>
  );
};

export default Index;
