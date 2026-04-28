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

// 4. Middleware: tell Express to understand JSON
//    Without this line, req.body would be undefined
app.use(express.json());

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
// Authorization test routes
const authorize = require('./middleware/authorize');

// Anyone logged in can access this
app.get('/api/test/all', auth, (req, res) => {
  res.json({ message: 'Any logged-in user can see this', user: req.user });
});

// Only admins can access this
app.get('/api/test/admin', auth, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin! You have full access.' });
});

// Admins and members can access this
app.get('/api/test/team', auth, authorize('admin', 'member'), (req, res) => {
  res.json({ message: 'Welcome team member!' });
});

// Only viewers (read-only users)
app.get('/api/test/viewer', auth, authorize('viewer'), (req, res) => {
  res.json({ message: 'You have read-only access.' });
});

// 7. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop');
});