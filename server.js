// ============================
// WORSHIP TEAM MANAGER API
// ============================

// 1. Load environment variables from .env file
//    This must be the FIRST line — before anything else
const dotenv = require('dotenv');
dotenv.config();

// 2. Import express
const express = require('express');

// 3. Create the app
const app = express();
const connectDB = require('./config/db');
connectDB();
app.use(express.json());

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/setlists', require('./routes/setlists'));
app.use('/api/schedules', require('./routes/schedules'));
// 5. A simple test route to make sure everything works
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Worship Team Manager API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (coming in Part 3)',
      members: '/api/members (coming in Part 7)',
      songs: '/api/songs (coming in Part 8)',
      setlists: '/api/setlists (coming in Part 9)',
      schedules: '/api/schedules (coming in Part 10)'
    }
  });
});

// 6. Health check route — useful for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Protected test route — requires login
const auth = require('./middleware/auth');

app.get('/api/me', auth, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: req.user
  });
});
// Authorization test routes
const authorize = require('./middleware/authorize');

// Only admins can access this
app.get('/api/test/admin', auth, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have full access.' });
});

// Admins and members can access this
app.get('/api/test/team', auth, authorize('admin', 'member'), (req, res) => {
  res.json({ message: 'Welcome team member!' });
});

// Only viewers
app.get('/api/test/viewer', auth, authorize('viewer'), (req, res) => {
  res.json({ message: 'You have read-only access.' });
});
// 7. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});