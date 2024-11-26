// routes/carRoutes.js
const express = require('express');
const Car = require('../models/carData');

const Carplaque = require('../models/carPlaque');

const router = express.Router();

// Get all cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create a new car entry
router.post('/save-data', async (req, res) => {
  const { registerNumber, kilometersCovered, remainingLiters } = req.body;

  // Get the current month and year
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  try {
    // Check if an entry exists for the same registerNumber in the current month
    const existingEntry = await Car.findOne({
      registerNumber,
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Data for this carPlaque has already been submitted in this month. Please wait next month or contact system admin for futher assistance' });
    }

    const car = new Car({
      registerNumber,
      kilometersCovered,
      remainingLiters
    });

    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Check for missing data in CarData based on Car collection
router.get('/check-reminders', async (req, res) => {
  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  try {
    // Fetch all register numbers from the Car collection
    const cars = await Carplaque.find().select('registerNumber -_id');
    const registerNumbers = cars.map(car => car.registerNumber);

    // Fetch all entries in CarData for the current month
    const existingEntries = await Car.find({
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    }).select('registerNumber -_id');

    const existingRegisterNumbers = existingEntries.map(entry => entry.registerNumber);

    // Determine missing register numbers
    const missingEntries = registerNumbers.filter(
      registerNumber => !existingRegisterNumbers.includes(registerNumber)
    );

    res.status(200).json({ missingEntries });
  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).json({ message: 'Error checking reminders', error });
  }
});



module.exports = router;