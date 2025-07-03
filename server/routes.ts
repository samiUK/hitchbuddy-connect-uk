import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRideSchema, insertRideRequestSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signUpSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create user
      const user = await storage.createUser(validatedData);
      
      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie
      res.cookie('session', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = signInSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session
      const session = await storage.createSession(user.id);
      
      // Set session cookie
      res.cookie('session', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Signin error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signout", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }
      res.clearCookie('session');
      res.json({ success: true });
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        await storage.deleteSession(sessionId);
        res.clearCookie('session');
        return res.status(401).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = resetPasswordSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal whether user exists or not
        return res.json({ success: true });
      }

      // In a real app, you would send an email here
      // For now, just return success
      res.json({ success: true });
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/auth/update-profile", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      console.log('Routes: Updating user profile:', session.userId, req.body);
      
      const updatedUser = await storage.updateUser(session.userId, req.body);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/user/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const userId = req.params.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password for privacy
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rides routes
  app.post("/api/rides", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rideData = {
        ...req.body,
        driverId: session.userId,
        isRecurring: req.body.isRecurring ? 'true' : 'false',
        recurringData: req.body.recurringData ? JSON.stringify(req.body.recurringData) : null
      };

      const ride = await storage.createRide(rideData);
      res.json({ ride });
    } catch (error) {
      console.error('Create ride error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await storage.getRides();
      res.json({ rides });
    } catch (error) {
      console.error('Get rides error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rides/my", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rides = await storage.getRidesByDriver(session.userId);
      res.json({ rides });
    } catch (error) {
      console.error('Get my rides error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/rides/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rideId = req.params.id;
      const existingRide = await storage.getRide(rideId);
      
      if (!existingRide) {
        return res.status(404).json({ error: "Ride not found" });
      }

      // Check if the user owns this ride
      if (existingRide.driverId !== session.userId) {
        return res.status(403).json({ error: "Not authorized to modify this ride" });
      }

      const updateData = {
        ...req.body,
        isRecurring: req.body.isRecurring ? 'true' : 'false',
        recurringData: req.body.recurringData ? JSON.stringify(req.body.recurringData) : null,
        updatedAt: new Date()
      };

      const updatedRide = await storage.updateRide(rideId, updateData);
      
      if (!updatedRide) {
        return res.status(404).json({ error: "Ride not found" });
      }

      res.json({ ride: updatedRide });
    } catch (error) {
      console.error('Update ride error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Ride requests routes
  app.post("/api/ride-requests", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const requestData = {
        ...req.body,
        riderId: session.userId
      };

      const rideRequest = await storage.createRideRequest(requestData);
      res.json({ rideRequest });
    } catch (error) {
      console.error('Create ride request error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ride-requests", async (req, res) => {
    try {
      const rideRequests = await storage.getRideRequests();
      res.json({ rideRequests });
    } catch (error) {
      console.error('Get ride requests error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ride-requests/my", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rideRequests = await storage.getRideRequestsByRider(session.userId);
      res.json({ rideRequests });
    } catch (error) {
      console.error('Get my ride requests error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete ride route
  app.delete("/api/rides/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rideId = req.params.id;
      const ride = await storage.getRide(rideId);

      if (!ride) {
        return res.status(404).json({ error: "Ride not found" });
      }

      // Check if the user owns this ride
      if (ride.driverId !== session.userId) {
        return res.status(403).json({ error: "Unauthorized to delete this ride" });
      }

      await storage.deleteRide(rideId);
      res.json({ message: "Ride deleted successfully" });
    } catch (error) {
      console.error('Delete ride error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update ride request route
  app.patch("/api/ride-requests/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const requestId = req.params.id;
      const updates = req.body;

      const updatedRequest = await storage.updateRideRequest(requestId, updates);
      if (!updatedRequest) {
        return res.status(404).json({ error: "Ride request not found" });
      }

      res.json({ rideRequest: updatedRequest });
    } catch (error) {
      console.error('Update ride request error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete ride request route
  app.delete("/api/ride-requests/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const requestId = req.params.id;
      const request = await storage.getRideRequest(requestId);

      if (!request) {
        return res.status(404).json({ error: "Ride request not found" });
      }

      // Check if the user owns this request
      if (request.riderId !== session.userId) {
        return res.status(403).json({ error: "Unauthorized to delete this request" });
      }

      await storage.deleteRideRequest(requestId);
      res.json({ message: "Ride request deleted successfully" });
    } catch (error) {
      console.error('Delete ride request error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      let bookingData;

      // Check if this is a counter offer or direct confirmation for a ride request
      if (req.body.rideRequestId) {
        const rideRequest = await storage.getRideRequest(req.body.rideRequestId);
        if (!rideRequest) {
          return res.status(404).json({ error: "Ride request not found" });
        }

        // Convert the ride request into a confirmed ride for this driver
        // This moves it from "Find Requests" to "My Rides & Bookings"
        const confirmedRide = await storage.createRide({
          driverId: session.userId,
          fromLocation: rideRequest.fromLocation,
          toLocation: rideRequest.toLocation,
          departureDate: rideRequest.departureDate || new Date().toISOString().split('T')[0],
          departureTime: rideRequest.departureTime,
          availableSeats: parseInt(rideRequest.passengers),
          price: req.body.totalCost,
          vehicleInfo: req.body.message && req.body.message.includes('Counter offer') ? 'Counter Offer' : 'Confirmed Ride',
          notes: req.body.message || 'Driver confirmed ride request',
          isRecurring: 'false',
          recurringData: null,
          status: 'active'
        });

        // Generate appropriate ride ID
        const now = new Date();
        const dateStr = now.getFullYear().toString() + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 90000) + 10000;
        const isCounterOffer = req.body.message && req.body.message.includes('Counter offer');
        const newRideId = isCounterOffer ? `CO-${dateStr}-${randomNum}` : `HB-${dateStr}-${randomNum}`;
        
        await storage.updateRide(confirmedRide.id, { rideId: newRideId });

        // Only remove from global pool if it's a direct confirmation, not a counter offer
        if (!isCounterOffer) {
          await storage.deleteRideRequest(req.body.rideRequestId);
        }

        bookingData = {
          ...req.body,
          riderId: rideRequest.riderId,
          driverId: session.userId,
          rideId: confirmedRide.id,
          totalCost: req.body.totalCost,
          status: isCounterOffer ? 'pending' : 'confirmed',
          phoneNumber: req.body.phoneNumber || null
        };
      } else if (req.body.riderId && !req.body.rideId && req.body.message && req.body.message.includes('Counter offer')) {
        // Driver creating a counter offer for a booking request - create a ride with original booking context
        const originalBooking = req.body.originalBookingId ? await storage.getBooking(req.body.originalBookingId) : null;
        const originalRide = originalBooking ? await storage.getRide(originalBooking.rideId) : null;

        if (originalRide) {
          // Create counter offer ride based on original ride
          const newRide = await storage.createRide({
            driverId: session.userId,
            fromLocation: originalRide.fromLocation,
            toLocation: originalRide.toLocation,
            departureDate: originalRide.departureDate,
            departureTime: originalRide.departureTime,
            availableSeats: originalBooking?.seatsBooked || 1,
            price: req.body.totalCost,
            vehicleInfo: 'Counter Offer',
            notes: req.body.message,
            isRecurring: 'false',
            recurringData: null,
            status: 'active'
          });

          // Generate a ride ID for the counter offer
          const now = new Date();
          const dateStr = now.getFullYear().toString() + 
                         (now.getMonth() + 1).toString().padStart(2, '0') + 
                         now.getDate().toString().padStart(2, '0');
          const randomNum = Math.floor(Math.random() * 90000) + 10000;
          const newRideId = `CO-${dateStr}-${randomNum}`;
          
          await storage.updateRide(newRide.id, { rideId: newRideId });

          bookingData = {
            ...req.body,
            driverId: session.userId,
            rideId: newRide.id,
            totalCost: req.body.totalCost,
            status: 'pending',
            phoneNumber: req.body.phoneNumber || null
          };
        } else {
          return res.status(400).json({ error: "Cannot create counter offer without original booking context" });
        }
      } else {
        // Normal booking for an existing ride
        const ride = await storage.getRide(req.body.rideId);
        if (!ride) {
          return res.status(404).json({ error: "Ride not found" });
        }

        // For testing purposes, allow riders to book their own rides
        // In production, you would add: if (ride.driverId === session.userId) return error
        
        // If this is a recurring ride without a rideId, generate one now
        if (ride.isRecurring === 'true' && !ride.rideId) {
          const now = new Date();
          const dateStr = now.getFullYear().toString() + 
                         (now.getMonth() + 1).toString().padStart(2, '0') + 
                         now.getDate().toString().padStart(2, '0');
          const randomNum = Math.floor(Math.random() * 90000) + 10000;
          const newRideId = `RB-${dateStr}-${randomNum}`;
          
          // Update the ride with the new rideId
          await storage.updateRide(ride.id, { rideId: newRideId });
        }
        
        bookingData = {
          ...req.body,
          riderId: session.userId,
          driverId: ride.driverId,
          totalCost: req.body.totalCost || (parseFloat(ride.price) * req.body.seatsBooked).toFixed(2)
        };
      }

      const booking = await storage.createBooking(bookingData);
      
      // Create notification for counter offers
      if (bookingData.message && bookingData.message.includes('Counter offer')) {
        await storage.createNotification({
          userId: bookingData.riderId,
          type: 'counter_offer',
          title: 'Counter Offer Received',
          message: `You have received a counter offer of £${bookingData.totalCost} for your ride request`,
          relatedId: booking.id,
          isRead: false
        });
      }
      
      res.json({ booking });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const bookings = await storage.getBookingsByUser(session.userId);
      console.log('Original bookings count:', bookings.length);
      
      // Enhance bookings with user details for chat functionality
      const enhancedBookings = await Promise.all(bookings.map(async (booking) => {
        console.log('Processing booking:', booking.id, 'riderId:', booking.riderId, 'driverId:', booking.driverId);
        
        const rider = await storage.getUser(booking.riderId);
        const driver = await storage.getUser(booking.driverId);
        
        console.log('Rider found:', rider ? `${rider.firstName} ${rider.lastName}` : 'null');
        console.log('Driver found:', driver ? `${driver.firstName} ${driver.lastName}` : 'null');
        
        const enhanced = {
          ...booking,
          riderName: rider ? `${rider.firstName} ${rider.lastName}` : 'Rider',
          riderAvatar: rider?.avatarUrl || null,
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Driver',
          driverAvatar: driver?.avatarUrl || null
        };
        
        console.log('Enhanced booking fields:', {
          riderName: enhanced.riderName,
          riderAvatar: enhanced.riderAvatar ? 'has avatar' : 'no avatar',
          driverName: enhanced.driverName,
          driverAvatar: enhanced.driverAvatar ? 'has avatar' : 'no avatar'
        });
        
        return enhanced;
      }));
      
      console.log('Enhanced bookings count:', enhancedBookings.length);
      res.json({ bookings: enhancedBookings });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Decline counter offer - special handling to reactivate original request
  app.patch("/api/bookings/:id/decline-counter-offer", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Verify this is either the rider declining their own counter offer OR driver cancelling a booking request
      if (booking.riderId !== session.userId && booking.driverId !== session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Delete the counter offer booking
      await storage.updateBooking(req.params.id, { status: 'cancelled' });

      // Delete the counter offer ride if it exists and reactivate as ride request
      if (booking.rideId) {
        const ride = await storage.getRide(booking.rideId);
        if (ride && ride.rideId && ride.rideId.startsWith('CO-')) {
          // This is a counter offer, delete it and reactivate as ride request
          await storage.deleteRide(booking.rideId);
          
          // Create a new ride request from the original ride details
          await storage.createRideRequest({
            riderId: booking.riderId,
            fromLocation: ride.fromLocation,
            toLocation: ride.toLocation,
            departureDate: ride.departureDate,
            departureTime: ride.departureTime,
            passengers: ride.availableSeats.toString(),
            maxPrice: ride.price,
            notes: ride.notes || 'Reactivated after counter offer decline',
            status: 'active'
          });
        }
      }

      res.json({ message: "Counter offer declined and request reactivated" });
    } catch (error) {
      console.error('Error declining counter offer:', error);
      res.status(500).json({ error: "Failed to decline counter offer" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Get the current booking to check if it's a counter offer being accepted
      const currentBooking = await storage.getBooking(id);
      if (!currentBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // With unified rideId system, bookings already have proper ride references
      if (status === 'confirmed') {
        // Simply update the booking status - ride is already linked via rideId
        const updatedBooking = await storage.updateBooking(id, { status });
        return res.json({ booking: updatedBooking });
      }

      // Regular booking update
      const updatedBooking = await storage.updateBooking(id, { status });
      res.json({ booking: updatedBooking });
    } catch (error) {
      console.error('Update booking error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get bookings by ride ID (for checking seat availability)
  app.get("/api/bookings/ride/:rideId", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const rideId = req.params.rideId;
      const bookings = await storage.getBookingsByRide(rideId);
      res.json(bookings);
    } catch (error) {
      console.error('Get bookings by ride error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Messages routes
  app.post('/api/messages', async (req, res) => {
    try {
      const session = await storage.getSession(req.cookies.session);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const { bookingId, message } = req.body;
      
      if (!bookingId || !message) {
        return res.status(400).json({ error: "Booking ID and message are required" });
      }

      // Get booking details to find the recipient
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Determine recipient (if sender is driver, recipient is rider, and vice versa)
      const recipientId = booking.driverId === session.userId ? booking.riderId : booking.driverId;
      
      // Get sender details for notification
      const sender = await storage.getUser(session.userId);
      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }

      const messageData = {
        bookingId,
        senderId: session.userId,
        message,
        createdAt: new Date()
      };

      const newMessage = await storage.createMessage(messageData);
      
      // Create notification for the recipient
      await storage.createNotification({
        userId: recipientId,
        type: 'message',
        title: 'New Message',
        message: `${sender.firstName} has sent you a message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
        relatedId: bookingId,
        isRead: false
      });

      res.json({ message: newMessage });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get('/api/bookings/:bookingId/messages', async (req, res) => {
    try {
      const session = await storage.getSession(req.cookies.session);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const { bookingId } = req.params;
      const messages = await storage.getMessagesByBooking(bookingId);
      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Get all conversations for a user
  app.get('/api/conversations', async (req, res) => {
    try {
      const session = await storage.getSession(req.cookies.session);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      // Get all confirmed bookings for this user
      const bookings = await storage.getBookingsByUser(session.userId);
      const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
      
      const conversations = [];
      
      for (const booking of confirmedBookings) {
        try {
          const messages = await storage.getMessagesByBooking(booking.id);
          if (messages.length > 0) {
            const partnerId = booking.riderId === session.userId ? booking.driverId : booking.riderId;
            const partner = await storage.getUser(partnerId);
            
            if (partner) {
              const lastMessage = messages[messages.length - 1];
              const unreadCount = messages.filter(m => !m.isRead && m.senderId !== session.userId).length;
              
              conversations.push({
                booking,
                partner: {
                  id: partner.id,
                  firstName: partner.firstName,
                  lastName: partner.lastName,
                  avatarUrl: partner.avatarUrl
                },
                messages,
                lastMessage,
                unreadCount
              });
            }
          }
        } catch (error) {
          console.error('Error processing booking messages:', booking.id, error);
        }
      }
      
      // Sort by last message timestamp
      conversations.sort((a, b) => 
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      );
      
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const notifications = await storage.getNotifications(session.userId);
      const unreadCount = await storage.getUnreadNotificationCount(session.userId);
      
      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      await storage.markAllNotificationsAsRead(session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rating routes
  app.post("/api/ratings", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const ratingData = {
        bookingId: req.body.bookingId,
        raterId: session.userId,
        ratedUserId: req.body.ratedUserId,
        rating: req.body.rating,
        review: req.body.review
      };

      const rating = await storage.createRating(ratingData);
      res.json({ rating });
    } catch (error) {
      console.error('Create rating error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ratings/:userId", async (req, res) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        res.clearCookie('session');
        return res.status(401).json({ error: "Invalid session" });
      }

      const ratings = await storage.getRatingsByUser(req.params.userId);
      res.json({ ratings });
    } catch (error) {
      console.error('Get ratings error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin API routes - Only accessible to admin users
  const isAdmin = (email: string) => {
    return email === 'coolsami_uk@yahoo.com'; // Primary admin
  };

  // Admin middleware to check authentication and admin status
  const adminAuth = async (req: any, res: any, next: any) => {
    try {
      const sessionId = req.cookies.session;
      if (!sessionId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const session = await storage.getSession(sessionId);
      if (!session || new Date() > session.expiresAt) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (!isAdmin(user.email)) {
        return res.status(403).json({ error: "Admin access required" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  // Get all users (admin only)
  app.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get admin statistics (admin only)
  app.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:userId", adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get user to check if they're admin
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deletion of admin users
      if (isAdmin(userToDelete.email)) {
        return res.status(400).json({ error: "Cannot delete admin users" });
      }

      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
