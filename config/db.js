// This file connects our app to MongoDB
// We'll use it in Part 2 — for now it's ready and waiting

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Stop the app if DB connection fails
  }
};

module.exports = connectDB;