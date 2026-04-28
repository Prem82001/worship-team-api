const mongoose = require('mongoose');

// This "schema" defines what a User looks like in the database
// Think of it as a form — every user must fill in these fields

const userSchema = new mongoose.Schema({
  username: {
    type: String,        // text
    required: true,      // can't be empty
    unique: true,        // no two users can have the same username
    trim: true           // removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true      // converts to lowercase automatically
  },
  password: {
    type: String,
    required: true,
    minlength: 6         // at least 6 characters
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],  // only these 3 values allowed
    default: 'viewer'    // new users start as viewers
  }
}, {
  timestamps: true       // automatically adds createdAt and updatedAt
});

// "User" becomes the "users" collection in MongoDB
module.exports = mongoose.model('User', userSchema);