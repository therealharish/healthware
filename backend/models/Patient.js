const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Patient Schema
const PatientSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    medications: [String],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String
    }]
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  appointments: [{
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  }],
  prescriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  testResults: [{
    type: Schema.Types.ObjectId,
    ref: 'TestResult'
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

// Update the updatedAt field before saving
PatientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Patient', PatientSchema);
