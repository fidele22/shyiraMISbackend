const mongoose = require('mongoose');
const FuelStock = require('./fuelStock');
const FuelStockHistory = require('./fuelStockHistory')

const FuelRequisitionRecievedSchema = new mongoose.Schema({
originalRequisitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuelRequisition',
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fuelType: { type: String, required: true },
  requesterName: {
    type: String,
    required: true
  },
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

  // totaFuelGain:{type:Number,required:true},

  file:{type:String},
  createdAt: {
    type: Date,
    default: Date.now
  },
  hodName: { type: String, required: true },
  hodSignature: { type: String },
  clicked: { type: Boolean, default: false }, 
});

FuelRequisitionRecievedSchema.post('save', async function(doc, next) {

  try {

       // Log carPlaque to verify its value
       console.log('carPlaque value:', doc.carPlaque);
    // Find the current fuel stock for the requested fuel type
    const fuelStock = await FuelStock.findOne({ fuelType: doc.fuelType });

   
    if (fuelStock) {
      // Update the fuel stock by subtracting the quantity received
      fuelStock.quantity = fuelStock.quantity - doc.quantityReceived;

      fuelStock.totalAmount -=doc.quantityReceived * fuelStock.pricePerUnit;

      // Save the updated fuel stock
      await fuelStock.save();

      // Log the update in the FuelStockHistory collection
      const fuelStockHistory = new FuelStockHistory({
        itemId: fuelStock._id,
        carplaque: doc.carPlaque, 
        exit: {
          quantity: doc.quantityReceived,
          pricePerUnit: fuelStock.pricePerUnit,
          totalAmount: doc.quantityReceived * fuelStock.pricePerUnit,
        },
        balance: {
          quantity: fuelStock.quantity,
          pricePerUnit: fuelStock.pricePerUnit,
          totalAmount: fuelStock.totalAmount,
        },
        updatedAt: Date.now(),
      });

      await fuelStockHistory.save();
    } else {
      console.error(`Fuel stock not found for fuel type: ${doc.fuelType}`);
    }

    next();
  } catch (error) {
    console.error('Error updating fuel stock:', error);
    next(error);
  }
});


module.exports = mongoose.model('FuelRequisitionRecieved', FuelRequisitionRecievedSchema);
