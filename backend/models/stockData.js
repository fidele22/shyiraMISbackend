const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
  entry: {
    quantity: { type: Number, default: 0 }, // Changed to Number
    pricePerUnit: { type: Number, default: 0 }, // Changed to Number
    totalAmount: { type: Number, default: 0 } // Changed to Number
  },
  exit: {
    quantity: { type: Number, default: 0 }, // Changed to Number
    pricePerUnit: { type: Number, default: 0 }, // Changed to Number
    totalAmount: { type: Number, default: 0 } // Changed to Number
  },
  balance: {
    quantity: { type: Number, default: 0 }, // Changed to Number
    pricePerUnit: { type: Number, default: 0 }, // Changed to Number
    totalAmount: { type: Number, default: 0 } // Changed to Number
  },
  updatedAt: { type: Date, default: Date.now }
});

const StockData = mongoose.model('StockData', stockHistorySchema);

module.exports = StockData;
