// Doctor routes with MongoDB
const express = require('express');
const router = express.Router();
const Prescription = require('./models/Prescription');

// Add prescription for a patient
router.post('/prescriptions', async (req, res) => {
  const { doctorEmail, patientEmail, prescription } = req.body;
  if (!doctorEmail || !patientEmail || !prescription) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    const entry = new Prescription({
      doctorEmail,
      patientEmail,
      prescription,
    });
    
    await entry.save();
    res.status(201).json({ message: 'Prescription added', entry });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List prescriptions for a patient
router.get('/prescriptions', async (req, res) => {
  const { patientEmail } = req.query;
  if (!patientEmail) {
    return res.status(400).json({ message: 'Missing patientEmail' });
  }
  
  try {
    const prescriptions = await Prescription.find({ patientEmail });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List prescriptions by doctor
router.get('/doctor-prescriptions', async (req, res) => {
  const { doctorEmail } = req.query;
  if (!doctorEmail) {
    return res.status(400).json({ message: 'Missing doctorEmail' });
  }
  
  try {
    const prescriptions = await Prescription.find({ doctorEmail });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

module.exports = router;
