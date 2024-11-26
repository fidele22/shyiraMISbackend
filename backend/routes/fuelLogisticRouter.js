// routes/department.js
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const ApprovedLogisticOrder = require('../models/logisticFuelApproved')
const fuelOrder = require('../models/logisticfuelrequest'); 
const ApprovedfuelOrder = require('../models/logisticFuelApproved')
const RecievedFuelOrder = require('../models/logisticFuelReceived')
const RejectedFuelOrder = require('../models/logisticfuelRejected')
// fuel logistic requisition 



router.post('/fuel-order', async (req, res) => {
  try {
    const {
      supplierName,
      items,  // Now handling items
      date,
      hodName,
      hodSignature
    } = req.body;

    items.forEach(item => {
      item.totalPrice = item.quantityRequested * item.pricePerUnit;
    });
    
    const newRequisition = new fuelOrder({
      supplierName,
      items,  // Store items here
      date,
      hodName,
      hodSignature
    });

    console.log(req.body); // Logs incoming request data

    // Save to the database
    const savedRequisition = await newRequisition.save();

    res.status(201).json(savedRequisition);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error: Could not create requisition' });
  }
});


// Route to fetch all logistic requests
router.get('/', async (req, res) => {
    try {
      const fuellogisticrequests = await fuelOrder.find();
      res.json(fuellogisticrequests);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  router.put('/:id', async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Ensure clicked field is updated
      if (req.body.clicked !== undefined) {
        updateData.clicked = req.body.clicked;
      }
    
      const updatedRequest = await fuelOrder.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedRequest) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  // Route to fetch all approved fuel logistic requests
router.get('/fuel-order', async (req, res) => {
  try {
    const fuellogisticorders = await ApprovedfuelOrder.find();
    res.json(fuellogisticorders);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

  // Route to fetch all approved fuel logistic requests
  router.get('/get-recieved-fuelorder', async (req, res) => {
    try {
      const fuellogisticreceived = await RecievedFuelOrder.find();
      res.json(fuellogisticreceived);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Route to fetch all approved fuel logistic requests
  router.get('/get-rejected-fuelorder', async (req, res) => {
    try {
      const fuellogisticrejected = await RejectedFuelOrder.find();
      res.json(fuellogisticrejected);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  // Route to fetch a single logistic request by ID
  router.get('/:id', async (req, res) => {
    try {
      const requestId = req.params.id;
      // Validate that requestId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
      const request = await fuelOrder.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Route to verify a request
router.post('/verified/:id', async (req, res) => {
    try {
      const requestId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const request = await fuelOrder.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      // Save to the verified collection
      const verifiedRequest = new ApprovedLogisticOrder(request.toObject());
      await verifiedRequest.save();
  
      // Optionally, remove from the original collection
      await fuelOrder.findByIdAndDelete(requestId);
  
      res.json(verifiedRequest);
    } catch (error) {
      console.error('Error verifying request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
// Route to mark  a fuel order as recieve
router.post('/recieved-fuel/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await ApprovedLogisticOrder.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Save to the recieved fuel order  collection
    const recievedOrder = new RecievedFuelOrder(request.toObject());
    await recievedOrder.save();

    // Optionally, remove from the original collection
    await ApprovedLogisticOrder.findByIdAndDelete(requestId);

    res.json(recievedOrder);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Route to handle rejection of a logistic fuel request



router.post('/rejectFuelOrder/:id', async (req, res) => {
  try {
   const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await fuelOrder.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Save to the rejected fuel order  collection
    const rejectedfuelOrder = new RejectedFuelOrder(request.toObject());
    await rejectedfuelOrder.save();

    // Optionally, remove from the original collection
    await fuelOrder.findByIdAndDelete(requestId);

    res.json(rejectedfuelOrder);
  } catch (error) {

      console.error('Error saving rejected order:', error);

      res.status(500).json({ message: 'Failed to save rejected order' });

  }

});


  module.exports = router;