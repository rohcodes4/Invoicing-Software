const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ensureAuthenticated } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, phone, company, address, website, name, GSTIN } = req.body;
        const user = new User({ username, email, password, phone, company, address, website, name, GSTIN });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login user
router.post('/login',passport.authenticate('local'), async (req, res) => {
    const { username, password } = req.body;

    // Find user by username and password (replace with your actual user authentication logic)
    const user = await User.findOne({username});
    // let isCorrectPassword = await user.comparePassword(password)
    
    // if(!isCorrectPassword){
    //     return res.status(401).json({ message: 'Invalid username or password' });
    // }
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, 'rohcodes');
    // const token = jwt.sign({ userId: user.id }, 'rohcodes', { expiresIn: '1h' });

    // Store the token in localStorage or sessionStorage
    // localStorage.setItem('authToken', token);
    
    // Return token to client
    res.json({ token });

    
});

// Logout user
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err) }});
    res.json({ message: 'Logged out' });
});

// Get the current user's profile
router.get('/profile', ensureAuthenticated, async (req, res) => {
    try {
        let userId = req.user.userId;
      let userIdObj = new mongoose.Types.ObjectId(userId);
      let user = await User.findOne({ _id: userIdObj });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;
