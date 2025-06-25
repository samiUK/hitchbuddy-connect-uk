import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';

export const BetaDisclaimer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged the disclaimer
    const hasAcknowledged = localStorage.getItem('hitchbuddy-beta-acknowledged');
    if (!hasAcknowledged) {
      setIsVisible(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('hitchbuddy-beta-acknowledged', 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <Card className="mx-4 my-3 border-yellow-300 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Beta Platform Notice</h3>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Hitchbuddy is currently in beta state and doesn't charge users for using the platform. 
                    The rides are not insured and only a contract between the Driver and the Rider.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button
                  onClick={handleAcknowledge}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  I Understand
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};