const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  registerNumber: {
    type: String,
    required: true,
    unique: true
  },
  modeOfVehicle: {
    type: String,
    required: true
  },
  dateOfReception: {
    type: Date,
    required: true
  },
  depart: {
    type: String,
    required: true
  },
  destination:{
    type:String,
    required: true
  }

});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;
