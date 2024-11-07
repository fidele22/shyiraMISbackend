const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },  
  itemName: { type: String, required: true },
  quantityRequested: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const ApprovedLogisticRequestSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  supplierName: { type: String, required: true },
  items: [ItemSchema],
  logisticSignature: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const LogisticRequest = mongoose.model('ApprovedLogisticRequest', ApprovedLogisticRequestSchema);

module.exports = LogisticRequest;
