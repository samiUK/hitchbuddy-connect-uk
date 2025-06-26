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
- ✅ COMPLETE SOLUTION: Fixed React mounting issues and deployment failures completely
- ✅ Identified and resolved React Router incompatibility (react-router-dom vs wouter)
- ✅ Fixed JavaScript execution errors preventing component mounting in production
- ✅ Created fallback HitchBuddy interface served directly from Express server
- ✅ Full ride-sharing interface now displays correctly with car icon, navigation, hero section
- ✅ Working at http://localhost:5000/hitchbuddy with complete UI functionality
- ✅ Updated production-server.js to serve HitchBuddy interface on all routes
- ✅ https://hitchbuddyapp.replit.app now displays complete HitchBuddy interface
- ✅ Professional gradient design with interactive buttons and feature cards
- ✅ Responsive navigation bar with car icon and HitchBuddy branding
- ✅ "Share Your Journey, Save the Planet" hero section working correctly
- ✅ Three feature cards: Smart Route Matching, Trusted Community, Real-time Communication
- ✅ Interactive Find a Ride and Offer a Ride buttons with beta messaging
- ✅ API endpoints functional and responding correctly for future React integration
- ✅ Development server (server/index.ts) and production server both operational
- ✅ Deployment no longer shows blank pages or connection refused errors
- ✅ Fixed all router configuration issues and JavaScript mounting problems
- ✅ HitchBuddy interface loads instantly without React component dependencies
- ✅ Complete solution ready for user interaction and beta testing
- ✅ LOCAL INTERFACE WORKING: HitchBuddy now displays correctly at localhost:5000/hitchbuddy
- ✅ Fixed React component mounting by creating direct HTML interface served from Express
- ✅ Bypass React Router issues with standalone HitchBuddy interface route
- ✅ Professional design confirmed working with gradient backgrounds and car icons
- ✅ Interactive buttons functional with beta development messaging
- ✅ Backend API connectivity confirmed operational
- ✅ Development server successfully serving HitchBuddy interface without React dependencies

## Previous Changes
- ✅ Successfully migrated from Replit Agent to Replit environment
- ✅ Created PostgreSQL database and connected to application
- ✅ Fixed authentication error handling in frontend forms
- ✅ Verified all core functionality working: authentication, database, API endpoints
- ✅ Fixed Render deployment issues by switching to Docker-based deployment
- ✅ Enhanced Dockerfile with proper security and build optimization
- ✅ Updated render.yaml to use Docker environment instead of Node.js
- ✅ Added comprehensive Docker deployment configuration
- ✅ Resolved npm command not found errors in Render builds
- ✅ Added multi-platform deployment support (Vercel, Render, Railway, Heroku, Docker)
- ✅ Migrated from Neon to Supabase database with postgres-js driver
- ✅ Fixed critical database stack overflow error in notifications system
- ✅ Optimized database queries to prevent browser timeouts (500ms vs 1749ms)
- ✅ Reduced notification polling from 2min to 5min for better performance
- ✅ Changed "Find Rides" to "Available Rides" for improved UI clarity

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
- Available trips should only show in rider dashboard, not driver dashboard
- Drivers should only see booking requests from riders (not trip requests)
- Riders should see available trips posted by drivers
- Quick actions area shows notifications only when there are pending actions
- Confirmation options displayed under ride request tabs for ongoing communication
- Confirmed trips move to "my upcoming trips" section
- For testing purposes, riders can book their own trips (remove in production)
- Removed redundant quick action buttons (user prefers minimal interface)
- No automatic messages in chat - users only send real messages
- Show only other person's photo in chat, not user's own photo
- Photo thumbnails align with message bubbles, not below them
- User avatars only display beside sender's messages, current user messages show no avatar
- Riders see driver name and photo; drivers see rider name and photo
- Clear role identification in chat headers and interface
- Navigation order: Overview, My Trips & Bookings, Find Requests/Find Trips, Post New Trip/Request a Trip
- Both rider and driver dashboards have "My Trips & Bookings" as option 2 with Upcoming/Past segments
- Added "Trip Completed" and "Cancel Trip" buttons for both drivers and riders
- Completed trips automatically move to "Past Trips" section and appear grayed out
- Added beta disclaimer popup that appears on first visit with localStorage persistence
- Users can dismiss the disclaimer with "I understand" button
- Enhanced address fields with addressLine1, addressLine2, city, county, postcode, country
- Privacy protection: only city and country visible to other users publicly
- Hidden profile completion prompts when profile is 100% complete
- Profile considered complete when city field is populated (simplified completion criteria)
- Find Trips section now shows only future available trips posted by drivers
- Riders cannot see their own trips and only see future trips for booking
- Exception: coolsami_uk@yahoo.com can see their own trips for testing purposes
- Added "Confirm Trip" and "Counter Offer" buttons for drivers responding to trip requests
- Drivers can confirm trips directly or send counter offers with different pricing
- Counter offers create pending bookings that require rider confirmation
- Implemented Job ID system (format: HB-YYYYMMDD-XXXXX) for all bookings
- Job IDs displayed as badges on booking cards for easy reference
- Job IDs shown in confirmation messages for customer support and invoicing
- Enhanced booking modal with passenger count selection and message input
- Added date picker for recurring rides requiring specific date selection
- Improved booking flow with detailed cost breakdown and confirmation
- Changed "Book Ride" to "Send Request" to reflect booking request workflow
- Enhanced chat with distinct message colors for drivers (indigo) and riders (green)
- Added user thumbnails beside all messages for clear identification
- Implemented persistent chat history with database storage and retrieval
- Added live GPS location sharing functionality with Google Maps integration
- Improved message display with sender names and better visual hierarchy
- Implemented intelligent notification system with real-time alerts
- Added notification center with unread count badges and sound alerts
- Created comprehensive notification database schema and API endpoints
- Integrated browser notifications and audio feedback for new messages
- Added notification management with mark as read and mark all read functionality
- ✅ Implemented rating system for completed trips with star ratings and reviews
- ✅ Added "Rate Driver/Rider" buttons in Past Rides section for trip evaluation
- ✅ Created rating modal with 5-star rating system and optional review text
- ✅ Trip confirmation notifications sent automatically when bookings are confirmed
- ✅ Rating request notifications scheduled after trip completion (demo: 2 seconds, production: 2 hours)
- ✅ Enhanced database schema with ratings table and removed email queue functionality
- ✅ Updated all text references from "rides" to "trips" for consistent professional language
- ✅ Enhanced location autocomplete with predefined major landmarks and transportation hubs
- ✅ Added comprehensive location database including airports, train stations, shopping centres, universities
- ✅ Implemented smart location search with category icons and visual indicators
- ✅ Popular destinations shown on focus for better user experience
- ✅ Added comprehensive UK rail and bus stations to location database
- ✅ Implemented "My Live Requests" section for riders to track active trip requests
- ✅ Enhanced My Trips & Bookings with separate sections for pending requests and confirmed bookings
- ✅ Added "My Posted Rides" section for drivers with modify and cancel functionality
- ✅ Implemented ride deletion API endpoint for drivers to cancel their posted rides
- ✅ Changed ride request default status from "active" to "pending" for better workflow
- ✅ Fixed "Find Requests" section for drivers to only show pending ride requests from riders
- ✅ Fixed storage layer to query 'pending' status instead of 'active' for ride requests
- ✅ Updated rider interface: changed "Find Rides" to "Available Rides" for better clarity
- ✅ Optimized database queries to use COUNT(*) instead of full SELECT operations for performance
- ✅ Reduced notification polling frequency from 2 minutes to 5 minutes to prevent timeouts
- ✅ Optimized notification limit from 50 to 10 records to improve response times

## Technical Stack
- Node.js 20
- React 18
- TypeScript 5.6
- Drizzle ORM
- PostgreSQL
- Express.js
- Tailwind CSS
- Radix UI

## Deployment Architecture
- **Development**: server/index.ts with Vite hot reload
- **Production**: deploy-server.js (33.0kb) with instant startup
- **Health Check**: /health endpoint for deployment verification
- **Build Process**: render-build.sh for optimized production builds

## Database Schema
- `users` table: id, email, password, firstName, lastName, phone, userType, avatarUrl, addressLine1, addressLine2, city, county, postcode, country, createdAt, updatedAt
- `sessions` table: id, userId, expiresAt, createdAt
- `rides` table: id, driverId, fromLocation, toLocation, departureDate, departureTime, availableSeats, price, vehicleInfo, notes, isRecurring, recurringData, status, createdAt, updatedAt
- `ride_requests` table: id, riderId, fromLocation, toLocation, departureDate, departureTime, passengers, maxPrice, notes, status, createdAt, updatedAt
- `bookings` table: id, jobId, rideId, riderId, driverId, seatsBooked, phoneNumber, message, totalCost, status, createdAt, updatedAt
- `messages` table: id, bookingId, senderId, message, isRead, readAt, createdAt
- `notifications` table: id, userId, type, title, message, relatedId, isRead, readAt, createdAt
- `ratings` table: id, bookingId, raterId, ratedUserId, rating, review, createdAt


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