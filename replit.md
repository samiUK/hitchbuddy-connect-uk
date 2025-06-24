# Hitchbuddy - Ride Sharing Platform

## Project Overview
A modern ride-sharing platform built with React, TypeScript, Express.js, and PostgreSQL. Successfully migrated from Lovable to Replit environment with secure authentication and database management.

## Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Session-based auth with secure cookies
- **Deployment**: Replit-native deployment

## Recent Changes
- ✅ Migrated from Supabase to PostgreSQL with Drizzle ORM
- ✅ Implemented custom authentication system with sessions
- ✅ Created secure API routes for authentication
- ✅ Updated all components to use new auth system
- ✅ Removed all Supabase dependencies
- ✅ Database schema successfully pushed
- ✅ Implemented rides and ride requests functionality
- ✅ Connected frontend to backend APIs for ride-sharing
- ✅ Real-time data display for drivers and riders
- ✅ Added proper pricing display with £ symbol
- ✅ Implemented booking system with phone number collection
- ✅ Created booking modal for ride requests
- ✅ Added database tables for bookings and messages

## User Preferences
- Available rides should only show in rider dashboard, not driver dashboard
- Drivers should only see ride requests from riders
- Riders should see available rides posted by drivers

## Technical Stack
- Node.js 20
- React 18
- TypeScript 5.6
- Drizzle ORM
- PostgreSQL
- Express.js
- Tailwind CSS
- Radix UI

## Database Schema
- `users` table: id, email, password, firstName, lastName, phone, userType, avatarUrl, createdAt, updatedAt
- `sessions` table: id, userId, expiresAt, createdAt
- `rides` table: id, driverId, fromLocation, toLocation, departureDate, departureTime, availableSeats, price, vehicleInfo, notes, isRecurring, recurringData, status, createdAt, updatedAt
- `ride_requests` table: id, riderId, fromLocation, toLocation, departureDate, departureTime, passengers, maxPrice, notes, status, createdAt, updatedAt
- `bookings` table: id, rideId, riderId, driverId, seatsBooked, phoneNumber, message, totalCost, status, createdAt, updatedAt
- `messages` table: id, bookingId, senderId, message, createdAt

## Authentication System
- Session-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Secure session management
- Protected routes implementation

## API Endpoints
### Authentication
- POST /api/auth/signup - User registration
- POST /api/auth/signin - User login
- POST /api/auth/signout - User logout
- GET /api/auth/me - Get current user
- POST /api/auth/reset-password - Password reset
- PUT /api/auth/update-profile - Update user profile

### Rides
- POST /api/rides - Create new ride (drivers)
- GET /api/rides - Get all available rides
- GET /api/rides/my - Get user's own rides

### Ride Requests
- POST /api/ride-requests - Create new ride request (riders)
- GET /api/ride-requests - Get all ride requests
- GET /api/ride-requests/my - Get user's own ride requests

### Bookings
- POST /api/bookings - Create new booking (riders)
- GET /api/bookings - Get user's bookings (riders and drivers)