const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!['student', 'mentor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be student or mentor.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    // Auto-login after registration
    req.session.userId = user._id;
    res.status(201).json({ message: 'Registration successful!', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Store user ID in session
    req.session.userId = user._id;
    res.status(200).json({ message: 'Login successful!', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out.' });
});

// Logout endpoint (GET request for direct navigation)
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Profile endpoint (returns the currently logged-in user's details)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 