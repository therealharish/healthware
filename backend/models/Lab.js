const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Lab Schema
const LabSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Lab', LabSchema);
