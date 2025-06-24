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
- ✅ Implemented notification system for new ride requests
- ✅ Added confirmation workflow with approve/decline options
- ✅ Created "My Upcoming Rides" section for confirmed bookings
- ✅ Added quick actions area with notification badges
- ✅ Reorganized dashboard layout with "Post New Ride" as navigation tab
- ✅ Consolidated "My Upcoming Rides" with booking requests in same tab
- ✅ Added "Find Requests" tab for drivers to see rider requests
- ✅ Changed "Post New Ride" from button to dedicated tab for cleaner interface
- ✅ Added form data persistence for seamless tab switching
- ✅ Form data auto-saves and expires after 5 minutes for user convenience
- ✅ Reordered navigation tabs: Overview, My Bookings/Find Requests, My Rides & Bookings/Find Rides, Post New Ride
- ✅ Updated tab icons: My Bookings uses car icon, Find Rides uses magnifying glass icon
- ✅ Implemented "My Bookings" section for riders with confirmed and past bookings
- ✅ Added chat functionality for riders to communicate with drivers
- ✅ Separated upcoming and past bookings for better organization
- ✅ Enhanced profile editing with photo upload and address field for all users
- ✅ Updated database schema to include address field
- ✅ Implemented avatar upload with image preview and file size validation
- ✅ Added profile photo thumbnail and address display in dashboard header
- ✅ Updated storage layer to properly handle profile photo and address updates
- ✅ Implemented one-click profile completeness score with visual progress indicator
- ✅ Added missing fields display and completion percentage calculation
- ✅ Enhanced stats section with dynamic data based on actual user activity
- ✅ Implemented interactive messaging popup with context-aware design
- ✅ Added real-time chat interface with message threading and typing indicators
- ✅ Enhanced chat with trip details, timestamps, and delivery status
- ✅ Profile photo system fully functional with proper display across the platform
- ✅ Made chat system mobile-friendly with responsive design
- ✅ Added unread message indicators with red badges and highlighting
- ✅ Integrated profile photos in chat popup with proper avatar display
- ✅ Unified messaging experience across rider and driver interfaces
- ✅ Enhanced booking cards with consistent visual indicators for unread messages
- ✅ Standardized "Message Rider/Driver" button naming for clarity

## User Preferences
- Available rides should only show in rider dashboard, not driver dashboard
- Drivers should only see booking requests from riders (not ride requests)
- Riders should see available rides posted by drivers
- Quick actions area shows notifications only when there are pending actions
- Confirmation options displayed under ride request tabs for ongoing communication
- Confirmed rides move to "my upcoming rides" section
- For testing purposes, riders can book their own rides (remove in production)
- Removed redundant quick action buttons (user prefers minimal interface)
- No automatic messages in chat - users only send real messages
- Show only other person's photo in chat, not user's own photo
- Photo thumbnails align with message bubbles, not below them
- Riders see driver name and photo; drivers see rider name and photo
- Clear role identification in chat headers and interface
- Navigation order: Overview, My Rides & Bookings, Find Requests/Find Rides, Post New Ride/Request a Ride
- Both rider and driver dashboards have "My Rides & Bookings" as option 2 with Upcoming/Past segments
- Added "Ride Completed" and "Cancel Ride" buttons for both drivers and riders
- Completed rides automatically move to "Past Rides" section and appear grayed out
- Added beta disclaimer popup that appears on first visit with localStorage persistence
- Users can dismiss the disclaimer with "I understand" button

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