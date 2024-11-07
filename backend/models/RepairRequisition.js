const mongoose = require('mongoose');

const RequisitionSchema = new mongoose.Schema({
  department: { type: String, required: true },
  desitination: { type: String, required: true },
  carplaque: { type: String, required: true },
  unit: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  totalOverallPrice:{type:Number,required:true},
  date: { type: Date, required: true },
  hodName: { type: String, required: true },
  hodSignature: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Requisition', RequisitionSchema);
