const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Appointment Schema
const AppointmentSchema = new Schema({
  patientId: {
    type: Schema.Types.Mixed, // Allow both String and ObjectId for backward compatibility
    required: true
  },
  doctorId: {
    type: Schema.Types.Mixed, // Allow both String and ObjectId for backward compatibility
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String
  },
  doctorName: {
    type: String,
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
  notes: {
    type: String,
    default: ''
  },
  symptoms: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'booked', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'check-up', 'emergency'],
    default: 'consultation'
  },
  prescriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
