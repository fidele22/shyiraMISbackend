const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Position = require('../models/position'); // Import Position model
const Service = require('../models/service');
const Department = require('../models/department');

const createAdmin = async () => {
  await mongoose.connect('mongodb://localhost:27017/shyiradb', {
  
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin1', salt);

  // Fetch the desired position data
 
  const admin = new User({
    firstName: 'Admin',
    lastName: 'User',
    phone: '123456789',
    email: 'admin@gmail.com',
    signature: 'AdminSignature',
    password: hashedPassword,
    role: 'admin',
    positionName: 'adminposition', // Assign positionName from fetched position
    // serviceName and departmentName can be similarly fetched and assigned
    serviceName: 'admin', // Example, replace with actual fetched data
    departmentName: 'admin', // Example, replace with actual fetched data
  });

  try {
    await admin.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error creating admin user:', err);
  }

  mongoose.connection.close();
};

createAdmin();
