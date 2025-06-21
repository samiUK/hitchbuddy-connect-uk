
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, User, ArrowRight, CheckCircle } from "lucide-react";

interface UserTypeSelectionProps {
  onUserTypeSelect: (type: 'rider' | 'driver') => void;
}

export const UserTypeSelection = ({ onUserTypeSelect }: UserTypeSelectionProps) => {
  const userTypes = [
    {
      type: 'rider' as const,
      icon: <User className="h-12 w-12 text-blue-600" />,
      title: "I Need a Ride",
      description: "Find affordable rides to airports, stations, and your destination",
      features: [
        "Post ride requests instantly",
        "Browse available drivers",
        "Save up to 70% vs Uber",
        "Secure in-app messaging"
      ],
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100"
    },
    {
      type: 'driver' as const,
      icon: <Car className="h-12 w-12 text-green-600" />,
      title: "I'm a Driver",
      description: "Earn money by offering rides to passengers along your route",
      features: [
        "Choose your own schedule",
        "Set your own prices",
        "Earn extra income",
        "Meet interesting people"
      ],
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 hover:bg-green-100"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How would you like to use Hitchbuddy?
          </h2>
          <p className="text-xl text-gray-600">
            Choose your role to get started with the perfect experience for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {userTypes.map((userType) => (
            <Card 
              key={userType.type}
              className={`relative overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${userType.bgColor}`}
              onClick={() => onUserTypeSelect(userType.type)}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${userType.color}`}></div>
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-white rounded-full shadow-md">
                  {userType.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{userType.title}</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {userType.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {userType.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full mt-6 bg-gradient-to-r ${userType.color} hover:shadow-lg transition-all duration-300`}
                  size="lg"
                >
                  Get Started as {userType.type === 'rider' ? 'Rider' : 'Driver'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">
            You can always switch between roles later in your account settings
          </p>
        </div>
      </div>
    </section>
  );
};
