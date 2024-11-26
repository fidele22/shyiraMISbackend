const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItems', required: true },
  itemName: { type: String },
  quantityRequested: { type: Number, default: 0 },
  quantityReceived: { type: Number },
  observation: { type: String },
});

const RejectedRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  servive:String,
  items: [itemSchema],
  date: {type:Date},
  hodName: { type: String, required: true },
  hodSignature: { type: String },
  clicked: { type: Boolean, default: false },  //display new request word before click
  
  createdAt: {
      type: Date,
      default: Date.now
    },

});



module.exports = mongoose.model('RejectedRequest', RejectedRequestSchema);
