const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    
    if (!connectionString) {
      console.error('MongoDB connection error: MONGODB_URI environment variable is not set');
      return;
    }
    
    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string (without credentials):', connectionString.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication failed. Please check:');
      console.error('   1. Username and password in your connection string');
      console.error('   2. Database user exists in MongoDB Atlas');
      console.error('   3. Database user has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.error('🌐 Network error. Please check:');
      console.error('   1. Your IP address is whitelisted in MongoDB Atlas');
      console.error('   2. Internet connection is stable');
    }
    
    // Don't exit the process, allow the server to run even without DB
  }
};

module.exports = connectDB;
