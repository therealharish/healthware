// Patient routes with MongoDB
const express = require('express');
const router = express.Router();
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const TestBooking = require('./models/TestBooking');
const Order = require('./models/Order');

// Get all dashboard data for a patient
router.get('/dashboard', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }
  
  try {
    // Fetch data from various collections for the patient dashboard
    const appointments = await Appointment.find({ patientEmail: email });
    const prescriptions = await Prescription.find({ patientEmail: email });
    const testBookings = await TestBooking.find({ patientEmail: email });
    const orders = await Order.find({ patientEmail: email });
    
    res.json({
      appointments,
      prescriptions,
      testBookings,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

module.exports = router;
