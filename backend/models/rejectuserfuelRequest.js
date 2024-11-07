const mongoose = require('mongoose');

const RejectUserFuelRequisitionSchema = new mongoose.Schema({
originalRequisitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuelRequisition',
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: {
    type: String,
    required: true
  },
  fuelType: { type: String, required: true },
  carPlaque: {
    type: String,
    required: true
  },
  kilometers: {
    type: Number,
    required: true
  },
  quantityRequested: {
    type: Number,
    required: true
  },
  quantityReceived: {
    type: Number,
    default: 0
  },
  destination: {
    type: String,
    required: false,
  },
  remainingLiters: {
    type: String,
    required: true
  },
  average: {
    type: String,
    required: true,
  
  },
  reason: {
    type: String,
    
  },
  file:{type:String},
  createdAt: {
    type: Date,
    default: Date.now
  },
  hodName: { type: String, required: true },
  hodSignature: { type: String },
  clicked: { type: Boolean, default: false }, 
});


module.exports = mongoose.model('RejectUserFuelRequisition', RejectUserFuelRequisitionSchema);
