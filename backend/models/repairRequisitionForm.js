const mongoose = require('mongoose');

const repairRequisitionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, required: true },
  destination: { type: Number },
  carPlaque: {
    type: String,
    required: true
  },
  hodName: { type: String },
  hodSignature: { type: String },
  clicked: { type: Boolean, default: false },  //display new request word before click
  date:{type:Date},
  status: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'], // Enum to limit status values
    default: 'pending', // Default status is 'pending'
  },
  createdAt: {
      type: Date,
      default: Date.now
    },

});


module.exports = mongoose.model('RepairRequistion', repairRequisitionSchema);
