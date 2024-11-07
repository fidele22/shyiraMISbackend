const mongoose = require('mongoose');

// Reason model
const reasonSchema = new mongoose.Schema({
    reason: { type: String, required: true },
  });
  
  module.exports = mongoose.model('Reason', reasonSchema);
  