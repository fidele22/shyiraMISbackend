const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
  desitination: { type: String, required: true },
  unit: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const LogisticRepairSchema = new mongoose.Schema({
  carplaque:{ type:String, required:true},
  department:{type:String,required:true},
  date: { type: Date, required: true },
  supplierName: { type: String, required: true },
  items: [TypeSchema],
  totalOverallPrice:{type:String,required:true},
  hodName:{type:String},
  logisticSignature: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },

});

const LogisticRepairVerified = mongoose.model('LogisticRepairVerified', LogisticRepairSchema);

module.exports = LogisticRepairVerified;
