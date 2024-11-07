// models/ApprovedLogisticFuel.js
const mongoose = require('mongoose');
const FuelStock = require('./fuelStock');
const FuelStockHistory = require('./fuelStockHistory') // Import the FuelStock model

const receivedFuelSchema = new mongoose.Schema({
  desitination: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const receivedFuelOrderSchema = new mongoose.Schema({
  supplierName: { type: String, required: false },
  items: [receivedFuelSchema], // Array of items
  date: { type: Date, required: true },
  hodName: { type: String, required: true },
  hodSignature: { type: String },

  createdAt:{
    type:Date,
    default:Date.now,
  }
});

// Middleware to update fuel stock after saving an approved request
receivedFuelOrderSchema.post('save', async function(doc) {
  try {
    // Iterate over each item in the approved request
    for (const item of doc.items) {
      // Find the existing stock item
      let stockItem = await FuelStock.findOne({ fuelType: item.desitination });
      
      if (stockItem) {
        // Update quantity and totalAmount based on existing stock
        stockItem.quantity += item.quantityRequested;
        
        // Update pricePerUnit if it's different
        if (stockItem.pricePerUnit !== item.pricePerUnit) {
          stockItem.pricePerUnit = item.pricePerUnit;
        }
        
        // Recalculate totalAmount
        stockItem.totalAmount += item.totalPrice;
    // Save the updated stock item
     await stockItem.save();

        // Log the stock update in FuelStockHistory
        const fuelStockHistory = new FuelStockHistory({
            itemId: stockItem._id,
            carplaque: item.desitination, // Assuming 'desitination' is linked to carPlaque
            entry: {
              quantity: item.quantityRequested,
              pricePerUnit: stockItem.pricePerUnit,
              totalAmount: item.totalPrice,
            },
            balance: {
              quantity: stockItem.quantity,
              pricePerUnit: stockItem.pricePerUnit,
              totalAmount: stockItem.totalAmount,
            },
            updatedAt: Date.now(),
          });
  
          // Save history record
          await fuelStockHistory.save();
      } else {
        // Optionally handle the case where no existing stock item is found
        // If you don't want to handle it here, you can just ignore this case
        console.warn(`No fuel stock found for ${item.desitination}`);
      }

     
    }
  } catch (error) {
    console.error('Error updating fuel stock:', error);
  }
});

module.exports = mongoose.model('LogisticFuelRecieved', receivedFuelOrderSchema);
