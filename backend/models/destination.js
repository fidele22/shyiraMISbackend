const mongoose = require('mongoose');
// Destination model
const destinationSchema = new mongoose.Schema({
    destinationname: { type: String, required: false },
  });
  
  module.exports = mongoose.model('Destination', destinationSchema);
  