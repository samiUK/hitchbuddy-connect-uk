
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, MessageCircle } from "lucide-react";

interface LandingHeroProps {
  onGetStarted: () => void;
}

export const LandingHero = ({ onGetStarted }: LandingHeroProps) => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
            🚗 Launching in the UK
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Share Rides, Save Money,
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {" "}Make Friends
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            The affordable way to get to and from airports, stations, and beyond. Connect with trusted drivers and riders in your area.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Matched Journies</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span>Direct communication</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Trusted community</span>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={onGetStarted}
          >
            Start Your Journey
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Free to join • No subscription fees • Pay per ride
          </p>
        </div>
      </div>
    </section>
  );
};
