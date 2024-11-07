const mongoose = require('mongoose');
const StockData = require('./stockData');
const StockHistory =require('./stockHistory')

const StockItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },  // Changed to Number
  pricePerUnit: { type: Number, required: true },  // Changed to Number
  totalAmount: { type: Number, required: true },   // Corrected field name and changed to Number
});

// Middleware to delete related stock histories and stock data when a stock item is deleted
StockItemSchema.pre('findOneAndDelete', async function(next) {
  const stockItemId = this.getQuery()._id;

  try {
    // Delete related stock histories
    await StockHistory.deleteMany({ itemId: stockItemId });

    // Delete related stock data
    await StockData.deleteMany({ itemId: stockItemId });

    next();
  } catch (error) {
    next(error);
  }
});

const StockItem = mongoose.model('StockItems', StockItemSchema);

module.exports = StockItem;
