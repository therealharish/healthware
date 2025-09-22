const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Test Schema
const TestSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Test', TestSchema);
