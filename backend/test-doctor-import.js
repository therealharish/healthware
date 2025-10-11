// Test script to debug Doctor model import
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Step 1: Loading models...');
const User = require('./models/User');
console.log('User loaded:', typeof User, User.name);

const Patient = require('./models/Patient');
console.log('Patient loaded:', typeof Patient, Patient.name);

const Doctor = require('./models/Doctor');
console.log('Doctor loaded:', typeof Doctor, Doctor.name);
console.log('Doctor keys:', Object.keys(Doctor));
console.log('Doctor prototype:', Object.keys(Doctor.prototype || {}));

// Try to check if it's actually exported
console.log('\nStep 2: Re-requiring Doctor directly...');
delete require.cache[require.resolve('./models/Doctor')];
const Doctor2 = require('./models/Doctor');
console.log('Doctor2 loaded:', typeof Doctor2, Doctor2.name);

console.log('\nStep 3: Check mongoose models...');
console.log('Registered models:', mongoose.modelNames());
console.log('Get Doctor from mongoose:', mongoose.models.Doctor);
