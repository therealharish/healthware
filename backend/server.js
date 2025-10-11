const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import middleware
const { authenticateToken, optionalAuth } = require('./middleware/auth');

// Import models
const User = require('./models/User'); // This imports the 'Users' model defined in User.js
const Appointment = require('./models/Appointment');
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');
const Test = require('./models/Test');
const Lab = require('./models/Lab');
const TestBooking = require('./models/TestBooking');
const Prescription = require('./models/Prescription');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

const app = express();
app.use(cors());
app.use(bodyParser.json());
// Seed initial doctors if none exist
const seedDoctors = async () => {
  const count = await User.countDocuments({ userType: 'doctor' });
  if (count === 0) {
    const initialDoctors = [
      { 
        userType: 'doctor',
        firstName: 'Alice',
        lastName: 'Smith',
        specialty: 'Cardiology',
        gender: 'female',
        email: 'alice.smith@hospital.com',
        password: 'doctor123'
      },
      { 
        userType: 'doctor',
        firstName: 'Bob',
        lastName: 'Johnson',
        specialty: 'Dermatology',
        gender: 'male',
        email: 'bob.johnson@hospital.com',
        password: 'doctor123'
      },
      { 
        userType: 'doctor',
        firstName: 'Carol',
        lastName: 'Lee',
        specialty: 'Pediatrics',
        gender: 'female',
        email: 'carol.lee@hospital.com',
        password: 'doctor123'
      }
    ];
    await User.insertMany(initialDoctors);
    console.log('Initial doctors seeded');
  }
};

// Seed initial data
const seedDatabase = async () => {
  await seedDoctors();
  // Add more seed functions as needed
};

// Call seed function
seedDatabase();

// List doctors
// Get all doctors
app.get('/api/doctors', optionalAuth, async (req, res) => {
  try {
    const doctors = await User.find({ userType: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

// Get available time slots for a doctor on a specific date
app.get('/api/doctors/:doctorId/availability/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Get all booked appointments for this doctor on this date (only approved appointments block time slots)
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: 'approved' // Only approved appointments block the time slot
    }).select('time');
    
    const bookedTimes = bookedAppointments.map(apt => apt.time);
    
    // Extended time slots with more options
    const allTimeSlots = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
      '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'
    ];
    
    // Filter out booked time slots first
    let availableTimeSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));
    
    const selectedDate = new Date(date);
    const today = new Date();
    
    // If the selected date is today, filter out past time slots
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      
      console.log(`=== TIME FILTERING DEBUG ===`);
      console.log(`Server current time: ${today.toLocaleString()}`);
      console.log(`Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`Server ISO time: ${today.toISOString()}`);
      console.log(`Current hour: ${currentHour}, Current minute: ${currentMinute}`);
      console.log(`Selected date: ${selectedDate.toDateString()}`);
      console.log(`Today: ${today.toDateString()}`);
      console.log(`Total available slots before filtering: ${availableTimeSlots.length}`);
      
      // If it's past 6 PM or if it's very late (past 10 PM), return empty array
      if (currentHour >= 22) {
        console.log(`It's past 10 PM (${currentHour}:${currentMinute}), no slots available for today`);
        availableTimeSlots = [];
      } else if (currentHour >= 18) {
        console.log(`It's past 6 PM (${currentHour}:${currentMinute}), no more slots available for today`);
        availableTimeSlots = [];
      } else {
        availableTimeSlots = availableTimeSlots.filter(timeSlot => {
          const [time, period] = timeSlot.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          
          let slotHour = hours;
          if (period === 'PM' && hours !== 12) {
            slotHour += 12;
          } else if (period === 'AM' && hours === 12) {
            slotHour = 0;
          }
          
          // Add minutes to the slot time for comparison
          const slotMinutes = minutes || 0;
          const slotTotalMinutes = slotHour * 60 + slotMinutes;
          const currentTotalMinutes = currentHour * 60 + currentMinute;
          
          // Only show slots that are at least 1 hour (60 minutes) in the future
          const isAvailable = slotTotalMinutes > currentTotalMinutes + 60;
          
          console.log(`Time slot: ${timeSlot} -> ${slotHour}:${slotMinutes} (${slotTotalMinutes} mins) vs Current: ${currentHour}:${currentMinute} (${currentTotalMinutes} mins) -> Available: ${isAvailable}`);
          
          return isAvailable;
        });
      }
      
      console.log(`Available slots after filtering: ${availableTimeSlots.length}`, availableTimeSlots);
      console.log(`=== END TIME FILTERING DEBUG ===`);
    }
    
    res.json({
      date,
      doctorId,
      availableTimeSlots,
      bookedTimeSlots: bookedTimes
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
});

// Book appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    
    // Debug logging
    console.log('Booking appointment for user:', req.user);
    console.log('Request body:', req.body);
    
    // Find the doctor by ID
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the time slot is already approved for this doctor
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: 'approved' // Only check for approved appointments when booking
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: 'This time slot is already booked. Please choose a different time.' 
      });
    }

    const appointment = new Appointment({
      patientId: req.user._id, // Use ObjectId directly
      patientName: req.user.firstName + ' ' + req.user.lastName,
      patientEmail: req.user.email, // Add patient email
      doctorId: doctorId, // This should already be an ObjectId string
      doctorName: doctor.firstName + ' ' + doctor.lastName,
      date,
      time,
      notes,
      status: 'pending' // Changed from 'scheduled' to 'pending'
    });

    await appointment.save();
    console.log('Appointment saved successfully:', appointment);
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

// List appointments for a user (patient or doctor)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let result = [];
    console.log('Fetching appointments for user:', req.user._id, 'userType:', req.user.userType);
    
    const userId = req.user._id.toString();
    
    if (req.user.userType === 'patient') {
      // Search for appointments with both string and ObjectId formats
      // Include ALL appointments for patients so they can see request status
      result = await Appointment.find({ 
        $or: [
          { patientId: userId },
          { patientId: req.user._id }
        ]
        // Don't filter by status - patients should see all their requests
      });
    } else if (req.user.userType === 'doctor') {
      // Search for appointments with both string and ObjectId formats
      result = await Appointment.find({ 
        $or: [
          { doctorId: userId },
          { doctorId: req.user._id }
        ],
        status: { $nin: ['cancelled', 'rejected'] } // Exclude cancelled and rejected appointments
      });
    }
    
    console.log('Found appointments:', result.length);
    console.log('Appointments data:', result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel appointment
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    console.log('=== APPOINTMENT CANCELLATION DEBUG ===');
    console.log('User:', req.user);
    console.log('Appointment ID:', appointmentId);
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log('Found appointment:', appointment);
    console.log('Appointment patientId:', appointment.patientId, 'type:', typeof appointment.patientId);
    console.log('User _id:', req.user._id, 'type:', typeof req.user._id);
    
    // Check if the user owns this appointment (for patients) or is the assigned doctor
    if (req.user.userType === 'patient') {
      const userIdString = req.user._id.toString();
      const appointmentPatientId = appointment.patientId ? appointment.patientId.toString() : null;
      
      console.log('Patient comparison:', { 
        appointmentPatientId, 
        userIdString, 
        match: appointmentPatientId === userIdString 
      });
      
      if (!appointmentPatientId || appointmentPatientId !== userIdString) {
        console.log('Patient ID mismatch - access denied');
        return res.status(403).json({ message: 'You can only cancel your own appointments' });
      }
    }
    
    if (req.user.userType === 'doctor') {
      const userIdString = req.user._id.toString();
      const appointmentDoctorId = appointment.doctorId ? appointment.doctorId.toString() : null;
      
      console.log('Doctor comparison:', { 
        appointmentDoctorId, 
        userIdString, 
        match: appointmentDoctorId === userIdString 
      });
      
      if (!appointmentDoctorId || appointmentDoctorId !== userIdString) {
        console.log('Doctor ID mismatch - access denied');
        return res.status(403).json({ message: 'You can only cancel appointments assigned to you' });
      }
    }
    
    // Update appointment status to cancelled instead of deleting
    appointment.status = 'cancelled';
    await appointment.save();
    
    console.log('Appointment cancelled:', appointmentId);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

// Approve appointment request
app.put('/api/appointments/:id/approve', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Only doctors can approve appointments
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can approve appointments' });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if this doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only approve appointments assigned to you' });
    }
    
    // Check if appointment is still pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'This appointment is no longer pending approval' });
    }
    
    // Check if there are any other approved appointments for this patient at the same time
    const conflictingAppointment = await Appointment.findOne({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      status: 'approved',
      _id: { $ne: appointmentId }
    });
    
    if (conflictingAppointment) {
      // Reject this appointment as there's already an approved one
      appointment.status = 'rejected';
      await appointment.save();
      return res.status(409).json({ 
        message: 'Patient already has an approved appointment at this time with another doctor' 
      });
    }
    
    // Approve this appointment
    appointment.status = 'approved';
    await appointment.save();
    
    // Cancel all other pending appointments for this patient at the same date and time
    await Appointment.updateMany({
      patientId: appointment.patientId,
      date: appointment.date,
      time: appointment.time,
      status: 'pending',
      _id: { $ne: appointmentId }
    }, {
      status: 'rejected'
    });
    
    console.log('Appointment approved:', appointmentId);
    res.json({ message: 'Appointment approved successfully', appointment });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Error approving appointment' });
  }
});

// Reject appointment request
app.put('/api/appointments/:id/reject', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Only doctors can reject appointments
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can reject appointments' });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if this doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only reject appointments assigned to you' });
    }
    
    // Check if appointment is still pending
    if (appointment.status !== 'pending') {
      return res.status(400).json({ message: 'This appointment is no longer pending approval' });
    }
    
    // Reject the appointment
    appointment.status = 'rejected';
    await appointment.save();
    
    console.log('Appointment rejected:', appointmentId);
    res.json({ message: 'Appointment rejected successfully', appointment });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: 'Error rejecting appointment' });
  }
});

// Complete appointment (mark as completed)
app.put('/api/appointments/:id/complete', authenticateToken, async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Only doctors can complete appointments
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can complete appointments' });
    }
    
    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if this doctor owns this appointment
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only complete appointments assigned to you' });
    }
    
    // Check if appointment is approved (can complete)
    if (appointment.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved appointments can be marked as completed' });
    }
    
    // Complete the appointment
    appointment.status = 'completed';
    await appointment.save();
    
    console.log('Appointment completed:', appointmentId);
    res.json({ message: 'Appointment completed successfully', appointment });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Error completing appointment' });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { userType, firstName, lastName, gender, email, password, specialty } = req.body;
  
  // Validate required fields
  if (!userType || !firstName || !lastName || !gender || !email || !password) {
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['userType', 'firstName', 'lastName', 'gender', 'email', 'password']
    });
  }
  
  // Validate userType
  if (!['patient', 'doctor'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid userType. Must be either "patient" or "doctor"' });
  }
  
  // Validate specialty for doctors
  if (userType === 'doctor' && !specialty) {
    return res.status(400).json({ message: 'Specialty is required for doctor registration' });
  }
  
  // Validate gender
  if (!['male', 'female', 'other'].includes(gender)) {
    return res.status(400).json({ message: 'Invalid gender. Must be either "male", "female", or "other"' });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim(), userType });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email and user type' });
    }
    
    // Create new user (password will be hashed by the pre-save middleware)
    const userData = { 
      userType, 
      firstName: firstName.trim(), 
      lastName: lastName.trim(),
      gender, 
      email: email.toLowerCase().trim(), 
      password 
    };
    
    // Add specialty for doctors
    if (userType === 'doctor') {
      userData.specialty = specialty.trim();
    }
    
    const user = new User(userData);
    await user.save();

    // Note: We store all users (patients and doctors) in the Users collection
    // The separate Patient and Doctor models are for extended data if needed in the future
    // For now, the Users collection with userType field is sufficient
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        gender: user.gender,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { userType, email, password } = req.body;
  
  if (!userType || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase().trim(), userType });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password using the instance method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        gender: user.gender,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get current user (protected route)
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        userType: req.user.userType,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fullName: req.user.fullName,
        gender: req.user.gender,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const PORT = process.env.PORT || 5001;

// Get prescriptions for the authenticated patient
app.get('/api/my-prescriptions', authenticateToken, async (req, res) => {
  try {
    // Only patients can access their prescriptions
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access this endpoint' });
    }
    
    // Find prescriptions by patient email
    const prescriptions = await Prescription.find({ 
      patientEmail: req.user.email 
    }).sort({ createdAt: -1 }); // Most recent first
    
    console.log(`Found ${prescriptions.length} prescriptions for patient: ${req.user.email}`);
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: 'Error fetching prescriptions' });
  }
});

// Import feature routes after defining the data models
const testRoutes = require('./testRoutes');
const medicineRoutes = require('./medicineRoutes');
const doctorRoutes = require('./doctorRoutes');
const patientRoutes = require('./patientRoutes');

app.use('/api', testRoutes);
app.use('/api', medicineRoutes);
app.use('/api', doctorRoutes);
app.use('/api', patientRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      message: dbStatus === 'connected' ? 'Database connection successful' : 'Database connection failed'
    }
  });
});

// Export app for Vercel
module.exports = app;

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
