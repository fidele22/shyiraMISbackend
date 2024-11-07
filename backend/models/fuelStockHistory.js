const mongoose = require('mongoose');

const fuelStockHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelStock', required: true },
  carplaque: { type: String, required: true },
  entry: {
    quantity: { type: Number, default: 0 },
    pricePerUnit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  exit: {
    quantity: { type: Number, default: 0 },
    pricePerUnit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  balance: {
    quantity: { type: Number, default: 0 },
    pricePerUnit: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 }
  },
  updatedAt: { type: Date, default: Date.now }
});

const FuelStockHistory = mongoose.model('FuelStockHistory', fuelStockHistorySchema);

module.exports = FuelStockHistory;
