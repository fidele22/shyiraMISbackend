const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
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

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

module.exports = StockHistory;
