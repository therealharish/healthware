const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Medicine Schema
const MedicineSchema = new Schema({
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
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Medicine', MedicineSchema);
