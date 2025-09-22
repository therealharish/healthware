// Medicine routes with MongoDB
const express = require('express');
const router = express.Router();
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');

// Seed initial medicines if none exist
const seedMedicines = async () => {
  try {
    const count = await Medicine.countDocuments();
    if (count === 0) {
      const initialMedicines = [
        { id: 'med1', name: 'Paracetamol', price: 20, stock: 100 },
        { id: 'med2', name: 'Amoxicillin', price: 50, stock: 50 },
        { id: 'med3', name: 'Ibuprofen', price: 30, stock: 80 },
      ];
      await Medicine.insertMany(initialMedicines);
      console.log('Initial medicines seeded');
    }
  } catch (error) {
    console.error('Error seeding medicines:', error);
  }
};

// Call seed function
seedMedicines();

// List medicines
router.get('/medicines', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to cart and place order
router.post('/orders', async (req, res) => {
  const { patientEmail, cart } = req.body;
  if (!patientEmail || !cart || typeof cart !== 'object') {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Check stock
    for (const medId in cart) {
      const med = await Medicine.findOne({ id: medId });
      if (!med || med.stock < cart[medId]) {
        return res.status(400).json({ message: `Insufficient stock for ${med ? med.name : medId}` });
      }
    }
    
    // Deduct stock - use MongoDB transaction if available
    for (const medId in cart) {
      await Medicine.updateOne(
        { id: medId },
        { $inc: { stock: -cart[medId] } }
      );
    }
    
    const order = new Order({
      patientEmail,
      cart,
      status: 'placed',
    });
    
    await order.save();
    res.status(201).json({ message: 'Order placed', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List orders for a patient
router.get('/orders', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Missing email' });
  }
  
  try {
    const orders = await Order.find({ patientEmail: email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

module.exports = router;
