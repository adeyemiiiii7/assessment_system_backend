const express = require('express');
const User = require("../models/user");
const bycryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const auth = require("../middleware/auth");
const authRouter = express.Router();
const verifyToken = require('../middleware/verifyToken');

authRouter.post('/api/signup', async (req, res) => {
    try {
      const { username, password } = req.body;
      
        
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.
        status(400).json({ message: 'Username already exists' });
      }
  
      // If username is unique, hash the password and save the user
      const hashedPassword = await bycryptjs.hash(password, 8);
      let user = new User({
         username, 
         password: hashedPassword });
      await user.save();
    //  res.json(user);
      res.status(201).json({
         success: true,
         message: 'User created successfully' 
      });
    } catch (e) {
      res.status(500).json({ error: e.message });

  }
  });

// Login endpoint
authRouter.post('/api/login', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      const isValidPassword = await bycryptjs.compare(password, user.password);
      if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid password' });
      }
      const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1d'});
      res.json({ token, ...user._doc });
  } catch (e) {
      res.status(500).json({ error: e.message });
  }
});


  
  authRouter.get('/api/dashboard', verifyToken, (req, res) => {
    // Access user details from decoded token
    const { id, username } = req.user;
    
    // Return welcome message with user details
    res.json({ message: `Welcome to the dashboard, ${username}! Your user ID is ${id}` });
  });
  module.exports = authRouter;