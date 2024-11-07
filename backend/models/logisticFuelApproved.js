// models/ApprovedLogisticFuel.js
const mongoose = require('mongoose');

const approvedFuelSchema = new mongoose.Schema({
  desitination: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const approvedfuelOrderSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  items: [approvedFuelSchema], // Array of items
  date: { type: Date, required: true },
  hodName: { type: String, required: true },
  hodSignature: { type: String },

  createdAt:{
    type:Date,
    default:Date.now,
  }
});


module.exports = mongoose.model('ApprovedLogisticFuel', approvedfuelOrderSchema);
