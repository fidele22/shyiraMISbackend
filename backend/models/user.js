// models/User.js
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  positionName: {
    type: String,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  departmentName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role:{
    type:String,
    required: true,
  },
  signature: {
    type: String,// We'll store the path to the uploaded file
    required:false,
  },
  password: {
    type: String,
    required: true,
  },
});


const User = mongoose.model('User', UserSchema);

module.exports = User;
