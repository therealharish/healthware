// Test routes with MongoDB
const express = require('express');
const router = express.Router();
const Test = require('./models/Test');
const Lab = require('./models/Lab');
const TestBooking = require('./models/TestBooking');

// Seed initial tests if none exist
const seedTests = async () => {
  const count = await Test.countDocuments();
  if (count === 0) {
    const initialTests = [
      { id: 'test1', name: 'Blood Test', price: 500 },
      { id: 'test2', name: 'X-Ray', price: 1200 },
      { id: 'test3', name: 'MRI', price: 5000 },
    ];
    await Test.insertMany(initialTests);
    console.log('Initial tests seeded');
  }
};

// Seed initial labs if none exist
const seedLabs = async () => {
  const count = await Lab.countDocuments();
  if (count === 0) {
    const initialLabs = [
      { id: 'lab1', name: 'City Lab', address: '123 Main St' },
      { id: 'lab2', name: 'Health Diagnostics', address: '456 Oak Ave' },
    ];
    await Lab.insertMany(initialLabs);
    console.log('Initial labs seeded');
  }
};

// Seed test data
const seedTestData = async () => {
  try {
    await seedTests();
    await seedLabs();
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};

// Call seed function
seedTestData();

// List available tests
router.get('/tests', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List available labs
router.get('/labs', async (req, res) => {
  try {
    const labs = await Lab.find();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Book tests
router.post('/test-bookings', async (req, res) => {
  const { patientEmail, selectedTests, date, time, labId } = req.body;
  if (!patientEmail || !selectedTests || !date || !time || !labId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    const lab = await Lab.findOne({ id: labId });
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    
    const booking = new TestBooking({
      patientEmail,
      selectedTests,
      date,
      time,
      labId,
      labName: lab.name,
      status: 'booked',
    });
    
    await booking.save();
    res.status(201).json({ message: 'Test(s) booked', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List test bookings for a patient
router.get('/test-bookings', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }
  
  try {
    const bookings = await TestBooking.find({ patientEmail: email });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

module.exports = router;
