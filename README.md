# Hitchbuddy - Ride Sharing Platform

A modern ride-sharing platform connecting drivers and riders with secure authentication, real-time messaging, and comprehensive booking system.

## Features

- **Dual User Types**: Separate interfaces for drivers and riders
- **Real-time Messaging**: Chat system with unread indicators
- **Booking System**: Request rides, confirm bookings, manage trips
- **Location Search**: Autocomplete with UK landmarks and transport hubs
- **Notifications**: Real-time alerts for bookings and messages
- **Rating System**: Rate and review completed trips
- **Profile Management**: Complete profiles with photos and addresses

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **Platform**: Railway deployment

## Railway Deployment

1. Connect this repository to Railway
2. Set environment variable: `DATABASE_URL`
3. Deploy automatically

The application serves the React frontend and API endpoints from a single Express server optimized for Railway's Node.js environment.