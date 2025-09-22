const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TestBooking Schema
const TestBookingSchema = new Schema({
  patientEmail: {
    type: String,
    required: true
  },
  selectedTests: {
    type: [String],
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  labId: {
    type: String,
    required: true
  },
  labName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'cancelled'],
    default: 'booked'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestBooking', TestBookingSchema);
