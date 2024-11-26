
const express = require('express');
const router = express.Router();
const Car = require('../models/carPlaque');

// POST route to register a car
router.post('/cars', async (req, res) => {
  try {
    const { registerNumber, modeOfVehicle, dateOfReception, depart,destination } = req.body;
    
    // Create a new car entry
    const newCar = new Car({
      registerNumber,
      modeOfVehicle,
      dateOfReception,
      depart,
      destination,
    });

    await newCar.save();
    res.status(201).json({ message: 'Car registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register car.' });
  }
});

// GET route to fetch all cars
router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch car data.' });
  }
});

// PUT route to edit a car
router.put('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { registerNumber, modeOfVehicle, dateOfReception, depart } = req.body;
    
    const updatedCar = await Car.findByIdAndUpdate(
      id,
      { registerNumber, modeOfVehicle, dateOfReception, depart },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    res.status(200).json({ message: 'Car updated successfully!', car: updatedCar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update car.' });
  }
});

// DELETE route to delete a car
router.delete('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    res.status(200).json({ message: 'Car deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete car.' });
  }
});

module.exports = router;
