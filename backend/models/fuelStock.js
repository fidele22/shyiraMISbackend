// models/FuelStock.js
const mongoose = require('mongoose');

const fuelStockSchema = new mongoose.Schema({
  fuelType: {
    type: String,
    required: true,
    unique: true, // Ensure unique fuel types
  },
  quantity: {
    type: Number,
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const FuelStock = mongoose.model('FuelStock', fuelStockSchema);

module.exports = FuelStock;
