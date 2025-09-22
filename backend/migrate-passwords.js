const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import User model
const User = require('./models/User');

const migratePasswords = async () => {
  try {
    console.log('Starting password migration...');
    
    // Find all users with plain text passwords (passwords that don't start with $2)
    const users = await User.find({});
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!user.password.startsWith('$2')) {
        console.log(`Migrating password for user: ${user.email}`);
        
        // Hash the plain text password
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Update the user directly in the database (bypass the pre-save middleware)
        await User.updateOne(
          { _id: user._id },
          { password: hashedPassword }
        );
        
        console.log(`✅ Password migrated for: ${user.email}`);
      } else {
        console.log(`⏭️  Password already hashed for: ${user.email}`);
      }
    }
    
    console.log('Password migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run the migration
migratePasswords();
