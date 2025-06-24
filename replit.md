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

## User Preferences
None specified yet.

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

## Authentication System
- Session-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Secure session management
- Protected routes implementation

## API Endpoints
- POST /api/auth/signup - User registration
- POST /api/auth/signin - User login
- POST /api/auth/signout - User logout
- GET /api/auth/me - Get current user
- POST /api/auth/reset-password - Password reset
- PUT /api/auth/update-profile - Update user profile