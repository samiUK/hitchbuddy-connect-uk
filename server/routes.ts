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

      // Check if this is a counter offer for a ride request
      if (req.body.rideRequestId) {
        const rideRequest = await storage.getRideRequest(req.body.rideRequestId);
        if (!rideRequest) {
          return res.status(404).json({ error: "Ride request not found" });
        }

        // Driver creating a counter offer for a ride request
        bookingData = {
          ...req.body,
          riderId: rideRequest.riderId,
          driverId: session.userId,
          rideId: null, // No specific ride, this is a custom offer
          rideRequestId: req.body.rideRequestId, // Link to the ride request
          totalCost: req.body.totalCost || req.body.seatsBooked * 10, // Use provided cost
          status: req.body.status || 'pending',
          phoneNumber: req.body.phoneNumber || null // Allow null for counter offers
        };
      } else if (req.body.riderId && !req.body.rideId) {
        // Driver creating a counter offer for a booking request (no specific ride)
        bookingData = {
          ...req.body,
          driverId: session.userId,
          rideId: null, // No specific ride, this is a custom counter offer
          totalCost: req.body.totalCost,
          status: req.body.status || 'pending',
          phoneNumber: req.body.phoneNumber || null // Allow null for counter offers
        };
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
      res.json({ bookings });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({ error: "Internal server error" });
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

      // If accepting a counter offer (status = confirmed and rideId is null), create a ride
      if (status === 'confirmed' && !currentBooking.rideId && currentBooking.rideRequestId) {
        // Get the specific ride request using the stored reference
        const relatedRequest = await storage.getRideRequest(currentBooking.rideRequestId);
        
        if (relatedRequest) {
          // Create a new ride based on the ride request details
          const newRide = await storage.createRide({
            driverId: currentBooking.driverId,
            fromLocation: relatedRequest.fromLocation,
            toLocation: relatedRequest.toLocation,
            departureDate: relatedRequest.departureDate || new Date().toISOString().split('T')[0],
            departureTime: relatedRequest.departureTime,
            availableSeats: relatedRequest.passengers,
            price: currentBooking.totalCost,
            vehicleInfo: 'Counter Offer Vehicle',
            notes: currentBooking.message || 'Counter offer accepted',
            isRecurring: 'false',
            recurringData: null,
            status: 'active'
          });

          // Update the booking to reference the new ride
          const updatedBooking = await storage.updateBooking(id, { 
            status, 
            rideId: newRide.id 
          });

          // Mark the ride request as matched
          await storage.updateRideRequest(relatedRequest.id, { status: 'matched' });

          return res.json({ booking: updatedBooking });
        }
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

      const messageData = {
        bookingId,
        senderId: session.userId,
        message,
        createdAt: new Date()
      };

      const newMessage = await storage.createMessage(messageData);
      res.json({ message: newMessage });
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get('/api/messages/:bookingId', async (req, res) => {
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

  app.get("/api/messages/:bookingId", async (req, res) => {
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

      const bookingId = req.params.bookingId;
      const messages = await storage.getMessagesByBooking(bookingId);
      
      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: "Internal server error" });
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

  const httpServer = createServer(app);
  return httpServer;
}
