const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  amount: { type: Number, required: true },
  supplier_name:{ type: String, required: true},
  supplier_TIN:{ type: Number, required: true},
  date:{type: Date,required: true,default: Date.now},
  status:{type: String, required:true}
  
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
