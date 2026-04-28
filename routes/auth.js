const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ================================
// REGISTER — Create a new account
// POST /api/auth/register
// ================================

router.post('/register', async (req, res) => {
  try {
    // 1. Get the data from the request body
    const { username, email, password } = req.body;

    // 2. Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Please provide username, email, and password'
      });
    }

    // 3. Check if user already exists (by email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // 4. Hash the password
    //    "salt" adds random characters to make the hash unique
    //    10 = number of rounds (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the user in the database
    const newUser = new User({
      username,
      email,
      password: hashedPassword   // NEVER store plain text password!
    });

    // 6. Save to database
    const savedUser = await newUser.save();

    // 7. Send back success (don't send password back!)
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ================================
// LOGIN — Get a JWT token
// POST /api/auth/login
// ================================

router.post('/login', async (req, res) => {
  try {
    // 1. Get email and password from request
    const { email, password } = req.body;

    // 2. Check if both fields are provided
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // 3. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // 4. Compare the password with the hashed password
    //    bcrypt takes "prem123456" and checks it against "$2a$10$xK8f..."
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password'
      });
    }

    // 5. Create a JWT token
    //    This token contains the user's id and role
    //    It expires in 24 hours
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 6. Send back the token
    res.json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ================================
// MAKE ADMIN — Temporary route for setup
// PUT /api/auth/make-admin/:userId
// ================================

router.put('/make-admin/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `${user.username} is now an admin!`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;