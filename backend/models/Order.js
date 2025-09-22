const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Order Schema
const OrderSchema = new Schema({
  patientEmail: {
    type: String,
    required: true
  },
  cart: {
    type: Map,
    of: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipped', 'delivered'],
    default: 'placed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
