console.log('[SIMPLE] Starting HitchBuddy development server...');

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HitchBuddy development server running' });
});

// Mock API endpoints for development
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'test-user-1',
    email: 'test@hitchbuddy.com',
    firstName: 'Test',
    lastName: 'User',
    userType: 'rider'
  });
});

app.post('/api/auth/signin', (req, res) => {
  res.json({ message: 'Login successful', user: { id: 'test-user-1', email: req.body.email } });
});

app.post('/api/auth/signup', (req, res) => {
  res.json({ message: 'Registration successful', user: { id: 'test-user-1', email: req.body.email } });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

app.get('/api/rides', (req, res) => {
  res.json([
    {
      id: 'ride-1',
      driverId: 'driver-1',
      fromLocation: 'London',
      toLocation: 'Manchester',
      departureDate: '2025-07-05',
      departureTime: '09:00',
      availableSeats: 3,
      price: '25',
      vehicleInfo: 'Honda Civic',
      notes: 'Non-smoking vehicle'
    },
    {
      id: 'ride-2',
      driverId: 'driver-2',
      fromLocation: 'Birmingham',
      toLocation: 'Liverpool',
      departureDate: '2025-07-06',
      departureTime: '14:00',
      availableSeats: 2,
      price: '20',
      vehicleInfo: 'Toyota Prius',
      notes: 'Eco-friendly ride'
    }
  ]);
});

app.get('/api/bookings', (req, res) => {
  res.json({
    bookings: [
      {
        id: 'booking-1',
        rideId: 'ride-1',
        riderId: 'test-user-1',
        driverId: 'driver-1',
        fromLocation: 'London',
        toLocation: 'Manchester',
        departureDate: '2025-07-05',
        departureTime: '09:00',
        status: 'confirmed',
        totalCost: '25',
        message: 'Looking forward to the trip!'
      }
    ]
  });
});

// Serve the original React application built files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Serve the React app for all routes (SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Catch all other routes and serve the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Development Server running on port ${PORT}`);
  console.log(`📱 Your React application is available at http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});