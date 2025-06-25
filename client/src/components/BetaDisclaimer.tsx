import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const BetaDisclaimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hitchbuddy-beta-disclaimer');
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hitchbuddy-beta-disclaimer', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Beta Version Notice</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Welcome to Hitchbuddy! This is a beta version of our ride-sharing platform.
            </p>
            <p>
              <strong>Please note:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This is a demonstration platform for testing purposes</li>
              <li>All ride bookings and transactions are simulated</li>
              <li>Do not share real personal or financial information</li>
              <li>Features may be incomplete or change frequently</li>
            </ul>
            <p>
              By continuing, you acknowledge this is a beta testing environment.
            </p>
          </div>

          <Button onClick={handleAccept} className="w-full">
            I Understand - Continue to Hitchbuddy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};