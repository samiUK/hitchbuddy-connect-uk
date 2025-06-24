# Hitchbuddy - Ride Sharing Platform

A modern ride-sharing platform built with React, TypeScript, Express.js, and PostgreSQL.

## Features

- **User Authentication** - Secure signup/signin for riders and drivers
- **Ride Management** - Drivers can post rides, riders can request trips
- **Booking System** - Real-time booking with Job ID tracking
- **Messaging** - In-app chat between riders and drivers
- **Rating System** - 5-star rating system for completed trips
- **Notifications** - Real-time alerts for bookings and messages
- **Profile Management** - Complete user profiles with photo upload

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **Deployment**: Vercel Serverless Functions

## Deployment

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to "production"

## Features Overview

### For Riders
- Browse available rides posted by drivers
- Request rides with passenger count and message
- Track booking status and communicate with drivers
- Rate drivers after completed trips

### For Drivers  
- Post available rides with pricing and details
- View and respond to ride requests from riders
- Manage bookings and communicate with riders
- Rate riders after completed trips

## Local Development

1. Install dependencies: `npm install`
2. Set up environment variables
3. Push database schema: `npm run db:push`
4. Start development server: `npm run dev`

Built with modern web technologies for reliable ride-sharing.