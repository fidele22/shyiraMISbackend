const mongoose = require('mongoose');
const StockData = require('./stockData'); // Adjust the path to your StockData model
const StockItem = require('./stockItems'); // Adjust the path to your StockItems model
const StockHistory = require('./stockHistory'); // Adjust the path to your StockHistory model

const ItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
  itemName: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const RecievedLogisticRequestSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  supplierName: { type: String, required: true },
  items: [ItemSchema],
  logisticSignature: { type: String }
}, { timestamps: true });

RecievedLogisticRequestSchema.post('save', async function(doc, next) {
  try {
    // Iterate through all items in the received request
    for (const item of doc.items) {
      // Find the corresponding stock data by itemId
      const stockData = await StockData.findOne({ itemId: item.itemId });

      if (stockData) {
        // Update entry quantity and total amount
        stockData.entry.quantity = item.quantityRequested;
        stockData.entry.pricePerUnit = item.price;
        stockData.entry.totalAmount = item.quantityRequested * stockData.entry.pricePerUnit;

        // Update balance quantity and total amount
        stockData.balance.quantity += item.quantityRequested;
        stockData.balance.pricePerUnit = stockData.entry.pricePerUnit
        stockData.balance.totalAmount = stockData.balance.quantity * stockData.balance.pricePerUnit;

        // Save the updated stock data
        await stockData.save();

        // Update the corresponding StockItems
        const stockItem = await StockItem.findById(stockData.itemId); // Assuming `itemId` is used to reference `StockItem`
        if (stockItem) {
          stockItem.quantity = stockData.balance.quantity;
          stockItem.pricePerUnit = stockData.balance.pricePerUnit;
          stockItem.totalAmount = stockData.balance.totalAmount;
          await stockItem.save();
        }

        // Log the update to the StockHistory collection
        const stockHistory = new StockHistory({
          itemId: stockData.itemId,
          entry: stockData.entry,
          exit: stockData.exit,
          balance: stockData.balance,
          updatedAt: Date.now() // Set the updated date
        });
        await stockHistory.save();

      } else {
        console.error(`Stock data not found for item ID: ${item.itemId}`);
      }
    }

    next();
  } catch (error) {
    console.error('Error updating stock data:', error);
    next(error);
  }
});

module.exports = mongoose.model('RecievedLogisticRequest', RecievedLogisticRequestSchema);
