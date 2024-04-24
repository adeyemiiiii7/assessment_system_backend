const express = require('express');
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    // email: { type: String, required: true },
    type: {
        type: String,
        default: 'user'
    },
    password: { 
        type: String, 
        required: true,
        validate: {
            validator: (value) => {
                // Check if the password contains at least one symbol and one number
                return /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9]).{6,}$/.test(value);
            },
            message: "Password must contain at least one symbol and one number, and be at least 6 characters long"
        }},


  });
  const User = mongoose.model('User', userSchema);
  module.exports = User;