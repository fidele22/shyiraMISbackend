const mongoose = require('mongoose');
const StockData = require('./stockData');
const StockItem =require('./stockItems');
const StockHistory = require('./stockHistory') // Adjust the path to your StockData model

const recievedRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: String,
  service:String,
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
      itemName: String,
      quantityRequested: Number,
      quantityReceived: Number,
      observation: String,
    },
  ],
  hodName: { type: String, required: false},
  hodSignature: String,
  date :{tpye:Date},
  clicked: { type: Boolean, default: false },
  
}, { timestamps: true });

//// Middleware to update stock after a request is approved
recievedRequestSchema.post('save', async function(doc, next) {
  try {
    // Iterate through all items in the approved request
    for (const item of doc.items) {
      // Find the corresponding stock data by itemId
      const stockData = await StockData.findOne({ itemId: item.itemId });

      if (stockData) {
        // Update to asign the entry to zero when exit enable
        stockData.entry.quantity = 0;
        stockData.entry.totalAmount = 0;
        // Update the exit quantity and balance based on the quantity received in the approved request
        stockData.exit.quantity = item.quantityReceived;
        stockData.exit.pricePerUnit = stockData.balance.pricePerUnit;
        stockData.exit.totalAmount = stockData.exit.quantity * stockData.exit.pricePerUnit;

        // Update balance quantity
        stockData.balance.quantity -= item.quantityReceived;
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

module.exports = mongoose.model('RecievedRequest', recievedRequestSchema);
