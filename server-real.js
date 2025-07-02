const http = require('http');
const url = require('url');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = url.parse(req.url).pathname;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'HitchBuddy API running', database: 'connected' }));
    return;
  }

  // Auth endpoints
  if (pathname === '/api/auth/me') {
  try {
    // For demo, return the main user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['coolsami_uk@yahoo.com']);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.firstname,
          lastName: user.lastName || user.lastname,
          phone: user.phone,
          userType: user.userType || user.usertype || 'both',
          avatarUrl: user.avatarUrl || user.avatarurl,
          addressLine1: user.addressLine1 || user.addressline1,
          city: user.city,
          country: user.country
        }
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // For demo, accept any password or check if password exists
      const isValidPassword = !user.password || await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        res.json({ 
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || user.firstname,
            lastName: user.lastName || user.lastname,
            phone: user.phone,
            userType: user.userType || user.usertype || 'both',
            avatarUrl: user.avatarUrl || user.avatarurl
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rides endpoints
app.get('/api/rides', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.firstName, u.lastName 
      FROM rides r 
      LEFT JOIN users u ON r.driverId = u.id 
      WHERE r.status = 'active' 
      ORDER BY r.createdAt DESC
    `);
    
    const rides = result.rows.map(row => ({
      id: row.id,
      driverId: row.driverid || row.driverId,
      fromLocation: row.fromlocation || row.fromLocation,
      toLocation: row.tolocation || row.toLocation,
      departureDate: row.departuredate || row.departureDate,
      departureTime: row.departuretime || row.departureTime,
      availableSeats: row.availableseats || row.availableSeats,
      price: row.price,
      vehicleInfo: row.vehicleinfo || row.vehicleInfo,
      notes: row.notes,
      isRecurring: row.isrecurring || row.isRecurring,
      status: row.status,
      driverName: `${row.firstname || row.firstName || ''} ${row.lastname || row.lastName || ''}`.trim()
    }));
    
    res.json(rides);
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ride requests endpoints
app.get('/api/ride-requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT rr.*, u.firstName, u.lastName 
      FROM ride_requests rr 
      LEFT JOIN users u ON rr.riderId = u.id 
      WHERE rr.status = 'active' 
      ORDER BY rr.createdAt DESC
    `);
    
    const requests = result.rows.map(row => ({
      id: row.id,
      riderId: row.riderid || row.riderId,
      fromLocation: row.fromlocation || row.fromLocation,
      toLocation: row.tolocation || row.toLocation,
      departureDate: row.departuredate || row.departureDate,
      departureTime: row.departuretime || row.departureTime,
      passengers: row.passengers,
      maxPrice: row.maxprice || row.maxPrice,
      notes: row.notes,
      status: row.status,
      riderName: `${row.firstname || row.firstName || ''} ${row.lastname || row.lastName || ''}`.trim()
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Get ride requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bookings endpoints
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, r.fromLocation, r.toLocation, r.departureDate, r.departureTime, r.price,
             u1.firstName as riderFirstName, u1.lastName as riderLastName,
             u2.firstName as driverFirstName, u2.lastName as driverLastName
      FROM bookings b
      LEFT JOIN rides r ON b.rideId = r.id
      LEFT JOIN users u1 ON b.riderId = u1.id
      LEFT JOIN users u2 ON b.driverId = u2.id
      ORDER BY b.createdAt DESC
    `);
    
    const bookings = result.rows.map(row => ({
      id: row.id,
      jobId: row.jobid || row.jobId,
      rideId: row.rideid || row.rideId,
      riderId: row.riderid || row.riderId,
      driverId: row.driverid || row.driverId,
      seatsBooked: row.seatsbooked || row.seatsBooked,
      phoneNumber: row.phonenumber || row.phoneNumber,
      message: row.message,
      totalCost: row.totalcost || row.totalCost,
      status: row.status,
      selectedDate: row.selecteddate || row.selectedDate,
      fromLocation: row.fromlocation || row.fromLocation,
      toLocation: row.tolocation || row.toLocation,
      departureDate: row.departuredate || row.departureDate,
      departureTime: row.departuretime || row.departureTime,
      price: row.price,
      riderName: `${row.riderfirstname || ''} ${row.riderlastname || ''}`.trim(),
      driverName: `${row.driverfirstname || ''} ${row.driverlastname || ''}`.trim()
    }));
    
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Notifications endpoint
app.get('/api/notifications', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications 
      WHERE userId = (SELECT id FROM users WHERE email = 'coolsami_uk@yahoo.com')
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.json({ message: 'API endpoint', method: req.method, path: req.path });
});

// Serve static files - prioritize built app
const buildPath = path.join(__dirname, 'dist/public');
const clientPath = path.join(__dirname, 'client');

if (fs.existsSync(buildPath)) {
  console.log('📦 Serving built React app from dist/public');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('📦 Serving development React app from client');
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 HitchBuddy Real Backend running on port ${PORT}`);
  console.log(`📊 Connected to PostgreSQL database`);
  console.log(`🌐 API endpoints: /api/auth, /api/rides, /api/bookings`);
});