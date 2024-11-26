const mongoose = require('mongoose');

const itemRequisitionVerifiedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: String,
  service:String,
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
      itemName: String,
      quantityRequested: Number,
      quantityReceived: Number,
      observation: String
    }
  ],
  hodName: { type: String, required: false},
  hodSignature: { type: String },
  date:{type:Date},
  logisticName: { type: String }, // Add this field
  logisticSignature: { type: String }, // Add this field
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ItemRequisitionVerified', itemRequisitionVerifiedSchema);