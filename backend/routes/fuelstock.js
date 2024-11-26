const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Car = require('../models/carPlaque');
const FuelRequisitionReceived = require('../models/fuelRequestRecieved');
const FuelStock = require('../models/fuelStock');
const FuelStockHistory =require ('../models/fuelStockHistory');
const ApprovedRepairRequest = require('../models/logisticRepairApproved');
const CarData =require('../models/carData');

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
  const { page = 1, limit = 10, startDate, endDate, fetchAll } = req.query;

  const query = {};
  
  if (startDate && endDate) {
    query.updatedAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  try {
    if (fetchAll) {
      // If fetchAll is true, return all matching records without pagination
      const history = await FuelStockHistory.find(query).exec();
      const total = history.length; // Total records found
      return res.json({ total, history });
    } else {
      // Paginated response
      const skip = (page - 1) * limit;
      const [total, history] = await Promise.all([
        FuelStockHistory.countDocuments(query),
        FuelStockHistory.find(query).skip(skip).limit(parseInt(limit)).exec()
      ]);
      
      res.json({
        total,
        history
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
    const totalAverageCovered = requisitions.reduce((total, req) => total + req.average, 0);
    // Prepare report data
    const reportData = requisitions.map((req, index) => ({
      index: index + 1,
      registerNumber: car.registerNumber,
      modeOfVehicle: car.modeOfVehicle,
      dateOfReception: car.dateOfReception,
      destination: req.destination,
      litreConsumed: req.quantityReceived,
      averageCovered: req.average,
    }));

    return res.json({
      carInfo: {
        registerNumber: car.registerNumber,
        modeOfVehicle: car.modeOfVehicle,
        dateOfReception: car.dateOfReception
      },
      totalFuelConsumed,
      totalAverageCovered,
      reportData
    });
  } catch (error) {
    console.error('Error fetching stock report:', error);
    res.status(500).json({ message: 'Error fetching stock report' });
  }
});



// Endpoint to get car plaques and their data based on month and year
router.get('/fuelFull-Report', async (req, res) => {
  const { month, year } = req.query;

  // Determine start and end dates based on month and year
  let start, end;
  if (month && year) {
    start = new Date(year, month - 1, 1); // First day of the month
    end = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
  } else {
    return res.status(400).json({ message: 'Month and year must be provided.' });
  }

  try {
    // Fetch current month's data
    const fuelReportRequisitions = await FuelRequisitionReceived.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$carPlaque",
          totalQuantity: { $sum: "$quantityReceived" },
          totalAverageSum: { $sum: { $toDouble: "$average" } },
          requisitions: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "cars", // Lookup from the Car collection
          localField: "_id",
          foreignField: "registerNumber",
          as: "carInfo"
        }
      },
      {
        $unwind: "$carInfo"
      },
      {
        $lookup: {
          from: "cardatas", // Lookup from the CarData collection
          localField: "_id",
          foreignField: "registerNumber",
          as: "carDataInfo"
        }
      },
      {
        $unwind: {
          path: "$carDataInfo",
          preserveNullAndEmptyArrays: true // This allows for cases where there may not be car data
        }
      },
      {
        $project: {
          _id: 0,
          registerNumber: "$_id",
          modeOfVehicle: "$carInfo.modeOfVehicle",
          dateOfReception: "$carInfo.dateOfReception",
          depart: "$carInfo.depart",
          destination: "$carInfo.destination",
          totalFuelConsumed: "$totalQuantity",
         // distanceCovered: "$totalAverageSum",
          kilometersCovered: "$carDataInfo.kilometersCovered", // Current month's kilometers covered
          remainingLiters: "$carDataInfo.remainingLiters",
          mileageAtEnd: "$carDataInfo.kilometersCovered", // Mileage at end of the current month
        }
      }
    ]);

    // Fetch previous month's mileage at end from CarData
    const previousMonth = month === 1 ? 12 : month - 1; // Decrement month or wrap to December
    const previousYear = month === 1 ? year - 1 : year; // Decrement year if January

    // Fetch previous month's data to get mileage at end
    const previousMonthStart = new Date(previousYear, previousMonth - 1, 1);
    const previousMonthEnd = new Date(previousYear, previousMonth, 0, 23, 59, 59, 999);

    const previousMonthKilometers = await FuelRequisitionReceived.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonthStart, $lte: previousMonthEnd }
        }
      },
      {
        $group: {
          _id: "$carPlaque",
          kilometersCovered: { $last: "$kilometersCovered" } // Assuming this field exists in your documents
        }
      }
    ]);

    // Map previous month's mileage at end
    const previousMileageMap = previousMonthKilometers.reduce((acc, data) => {
      acc[data._id] = data.kilometersCovered;
      return acc;
    }, {});

    // Assign mileage at beginning for the current month
    fuelReportRequisitions.forEach(data => {
      data.mileageAtBeginning = previousMileageMap[data.registerNumber ] || 0; // Use previous month's end mileage or 0
      data.mileageAtEnd = data.kilometersCovered; // Current month's mileage at end
      data.distanceCovered = data.mileageAtEnd - data.mileageAtBeginning;
        // Calculate fuel consumed by subtracting remainingLiters
      data.fuelConsumed = data.totalFuelConsumed - data.remainingLiters;
      
    });

    // Assign mileage at beginning for the next month based on current month's mileage at end
    fuelReportRequisitions.forEach(data => {
      data.mileageAtBeginningNextMonth = data.mileageAtEnd; // For next month, assign current month's end mileage
    });

    res.json({ carPlaqueData: fuelReportRequisitions });
  } catch (error) {
    console.error('Error fetching car plaques:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Endpoint to get total cost of repairs for a specific car plaque based on month and year
router.get('/totalCostRepairs', async (req, res) => {
  const { month, year, carPlaque } = req.query;

  let start, end;
  if (month && year) {
    start = new Date(year, month - 1, 1); // First day of the month
    end = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
  } else {
    return res.status(400).json({ message: 'Month and year must be provided.' });
  }

  try {
    const totalCostRepairs = await ApprovedRepairRequest.aggregate([
      {
        $match: {
          carplaque: carPlaque, // Filter by specific car plaque
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$carplaque",
          totalRepairs: { $sum: { $toDouble: "$totalOverallPrice" } }
        }
      }
    ]);

    res.json({ totalCostRepairs: totalCostRepairs[0]?.totalRepairs || 0 });
  } catch (error) {
    console.error('Error fetching total cost repairs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

 module.exports = router;