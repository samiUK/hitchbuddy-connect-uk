import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuthNew";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin');
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      if (authMode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Password reset failed",
            description: error,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Password reset email sent!",
            description: "Check your email for instructions to reset your password."
          });
          setAuthMode('signin');
        }
      } else {
        const password = formData.get('password') as string;
        
        if (authMode === 'signin') {
          const { error } = await signIn(email, password);
          if (error) {
            toast({
              title: "Sign in failed",
              description: error,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Welcome back!",
              description: "You have been signed in successfully."
            });
          }
        } else {
          const firstName = formData.get('firstName') as string;
          const lastName = formData.get('lastName') as string;
          
          const { error } = await signUp(email, password, firstName, lastName, userType);
          if (error) {
            toast({
              title: "Sign up failed", 
              description: error,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Account created!",
              description: "Please check your email to verify your account."
            });
          }
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Hitchbuddy
            </span>
          </div>
        </div>

        {authMode === 'forgot-password' ? (
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setAuthMode('signin')}
                    className="text-sm"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to your Hitchbuddy account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password" 
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setAuthMode('forgot-password')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Join Hitchbuddy as a {userType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <Label>I want to join as:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={userType === 'rider' ? 'default' : 'outline'}
                        onClick={() => setUserType('rider')}
                        className="flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Rider</span>
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'driver' ? 'default' : 'outline'}
                        onClick={() => setUserType('driver')}
                        className="flex items-center space-x-2"
                      >
                        <Car className="h-4 w-4" />
                        <span>Driver</span>
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="password" 
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className={`w-full ${
                        userType === 'driver' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      }`}
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : `Create ${userType === 'driver' ? 'Driver' : 'Rider'} Account`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
