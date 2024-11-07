const express = require('express');
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';
const router = express.Router();
const FuelRequisition = require('../models/fuelRequisition');
const ForwardedFuelRequest = require('../models/fuelRequestVerified');
//const authMiddleware = require('../middlewares/userAthu')

const multer = require('multer');
const path = require('path');
//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_FILE || path.join(__dirname, 'files/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role; // Optional: store role if needed
    next();
  });
};

router.post('/submit',authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { requesterName, carPlaque, kilometers, remainingLiters, quantityRequested,
           quantityReceived,fuelType, reasonOption, hodName, hodSignature } = req.body;
   // Save the path of the uploaded signature, adjust as per your schema
    const file = req.file ? req.file.path : '';

    // Fetch the previous request for the same car
    const previousRequisition = await FuelRequisition.findOne({ carPlaque }).sort({ createdAt: -1 });

    let average = 0;
    if (previousRequisition) {
      const previousKilometers = previousRequisition.kilometers;
      const previousRemainingLiters = previousRequisition.remainingLiters;
      const previousQuantityReceived = previousRequisition.quantityReceived;

      // Calculate the average
      average = (kilometers - previousKilometers) / (previousRemainingLiters + previousQuantityReceived - remainingLiters);
    } else {
      // Handle case where no previous requisition exists
      average = 0; // or any default value
    }
    const userId = req.userId; // Extracted from token
    // Create a new FuelRequisition document
    const newRequest = new FuelRequisition({
      userId: userId,
      requesterName,
      carPlaque,
      kilometers,
      remainingLiters,
      quantityRequested,
      quantityReceived,
      fuelType,
      reasonOption,
      hodName,
      hodSignature,
      file,
      average, // Ensure average is included
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error:', error); // Debugging
    res.status(400).json({ error: error.message });
  }
});

// GET route to fetch all fuel requisitions
router.get('/', async (req, res) => {
  try {
    const requisitions = await FuelRequisition.find();
    res.status(200).json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pendingfuel', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const pendingFuelRequest = await FuelRequisition.find({ userId: userId });

    if (!pendingFuelRequest || pendingFuelRequest.length === 0) {
      return res.status(404).json({ message: 'No pending fuel requesition found for you.' });
    }
   
    res.json(pendingFuelRequest);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
}); 

// Route to fetch a single fuel requisition by ID
router.get('/:id', async (req, res) => {
  try {
    const requisition = await FuelRequisition.findById(req.params.id);
    if (!requisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }
    res.status(200).json(requisition);
  } catch (error) {
    console.error('Error fetching requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update and forward on another collection a fuel requisition by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedRequisition = await FuelRequisition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }


    //await updatedRequisition.save();

    res.status(200).json(updatedRequisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Route to verify and forward a fuel requisition by ID
router.post('/verify/:id', async (req, res) => {
  try {
    const updatedRequisition = await FuelRequisition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }

    // Forward the updated requisition to the forwarded collection
    const forwardedData = new ForwardedFuelRequest({
      ...updatedRequisition.toObject(),
      originalRequisitionId: updatedRequisition._id,
    });

    await forwardedData.save();

     // Optionally, remove the  request from the fuelRequistion  collection
     await FuelRequisition.findByIdAndDelete(req.params.id);
    res.status(200).json(updatedRequisition);
  } catch (error) {
    console.error('Error verifying requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
