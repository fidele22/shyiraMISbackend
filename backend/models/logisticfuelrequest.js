const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  desitination: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const repairSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  items: [itemSchema] , // Add this array of items
  date: { type: Date, required: true },
  hodName: { type: String, required: true },
  hodSignature: { type: String },

  createdAt: {
    type: Date,
    default: Date.now
  },

});
 
module.exports = mongoose.model('LogisticFuelRequest', repairSchema);
