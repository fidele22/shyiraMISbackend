const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Car = require('../models/carPlaque');
const FuelRequisitionReceived = require('../models/fuelRequestRecieved');
const FuelStock = require('../models/fuelStock')
const FuelStockHistory =require ('../models/fuelStockHistory')


// CRUD Routes

// Create a new fuel stock entry
router.post('/add-fuel', async (req, res) => {
    try {
      const { fuelType, quantity, pricePerUnit } = req.body;
      const totalAmount = quantity * pricePerUnit;
  
      const fuelStock = new FuelStock({
        fuelType,
        quantity,
        pricePerUnit,
        totalAmount,
      });
  
      await fuelStock.save();
      res.status(201).json(fuelStock);
    } catch (error) {
      res.status(500).json({ error: 'Error creating fuel stock entry' });
    }
  });
  
  // Read all fuel stock entries
  router.get('/', async (req, res) => {
    try {
      const fuelStocks = await FuelStock.find();
      res.status(200).json(fuelStocks);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching fuel stock entries' });
    }
  });
  
  // Update a fuel stock entry
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { fuelType, quantity, pricePerUnit } = req.body;
      const totalAmount = quantity * pricePerUnit;
  
      const updatedFuelStock = await FuelStock.findByIdAndUpdate(
        id,
        { fuelType, quantity, pricePerUnit, totalAmount },
        { new: true }
      );
  
      res.status(200).json(updatedFuelStock);
    } catch (error) {
      res.status(500).json({ error: 'Error updating fuel stock entry' });
    }
  });
  
  // Delete a fuel stock entry
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await FuelStock.findByIdAndDelete(id);
      res.status(200).json({ message: 'Fuel stock entry deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting fuel stock entry' });
    }
  });

// Get paginated fuel stock history
router.get('/fuel-history', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  try {
    const [total, history] = await Promise.all([
      FuelStockHistory.countDocuments(),
      FuelStockHistory.find().skip(skip).limit(parseInt(limit)).exec()
    ]);
    
    res.json({
      total,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// router of generating fuel stock report 


// Route to fetch stock report based on carPlaque and date range
router.get('/stock-report', async (req, res) => {
  const { carPlaque, startDate, endDate } = req.query;

  try {
    // Find the car based on carPlaque
    const car = await Car.findOne({ registerNumber: carPlaque });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Find all fuel requisitions for the carPlaque within the date range
    const requisitions = await FuelRequisitionReceived.find({
      carPlaque: carPlaque,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    // Calculate total fuel consumed
    const totalFuelConsumed = requisitions.reduce((total, req) => total + req.quantityReceived, 0);

    // Prepare report data
    const reportData = requisitions.map((req, index) => ({
      index: index + 1,
      registerNumber: car.registerNumber,
      modeOfVehicle: car.modeOfVehicle,
      dateOfReception: car.dateOfReception,
      destination: req.destination,
      litreConsumed: req.quantityReceived
    }));

    return res.json({
      carInfo: {
        registerNumber: car.registerNumber,
        modeOfVehicle: car.modeOfVehicle,
        dateOfReception: car.dateOfReception
      },
      totalFuelConsumed,
      reportData
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    res.status(500).json({ message: 'Error fetching stock report' });
  }
});


// Endpoint to get car plaques and their data based on date range
router.get('/fuelFull-Report', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // Fetch car plaques within the date range
    const fuelReportRequisitions = await FuelRequisitionReceived.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: "$carPlaque",
          totalQuantity: { $sum: "$quantityReceived" },
          totalAverage:{$sum:"$average"},
          requisitions: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "registerNumber",
          as: "carInfo"
        }
      },
      {
        $unwind: "$carInfo"
      },
      {
        $project: {
          _id: 0,
          registerNumber: "$_id",
          modeOfVehicle: "$carInfo.modeOfVehicle",
          dateOfReception: "$carInfo.dateOfReception",
          depart: "$carInfo.depart",
          destination: { $first: "$requisitions.destination" },
          totalFuelConsumed: "$totalQuantity",
          distanceCoverde:"$totalAverage"

        }
      }
    ]);

    res.json({ carPlaqueData: fuelReportRequisitions });
  } catch (error) {
    console.error('Error fetching car plaques:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





 module.exports = router;