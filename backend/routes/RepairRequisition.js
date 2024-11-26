const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Car = require ('../models/carPlaque')
const LogisticRepairRequest = require('../models/logisticRepairRequisition'); // Adjust the path as necessary
const VerifiedRepairRequest = require('../models/logisticRepairVerified');
const LogisticRepairVerified =require('../models/logisticRepairVerified')
const ApprovedRepairRequest = require('../models/logisticRepairApproved');
// Route to handle form submission

  router.post('/repair-submit', async (req, res) => {
    const {
        department,
        supplierName,
        carplaque,
        items,
        totalOverallPrice,
        date,
        hodName,
        hodSignature
    } = req.body;

    try {
        const newRequisition = new LogisticRepairRequest({
            carplaque,
            department,
            date,
            supplierName,
            items,
            totalOverallPrice,
            hodName,
            logisticSignature: hodSignature
        });

        await newRequisition.save();
        res.status(201).json({ message: 'Requisition submitted successfully', data: newRequisition });
    } catch (error) {
        console.error('Error submitting requisition:', error);
        res.status(500).json({ message: 'Error submitting requisition', error });
    }
});

// Route to fetch all logistic repair requests
router.get('/', async (req, res) => {
  try {
    const repairlogisticrequests = await LogisticRepairRequest.find();
    res.json(repairlogisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//router to verify logistic repair request

router.post('/verify-repair/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await LogisticRepairRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Save to the verified collection
    const verifiedrepairRequest = new VerifiedRepairRequest(request.toObject());
    await verifiedrepairRequest.save();

    // Optionally, remove from the original collection
    await LogisticRepairRequest.findByIdAndDelete(requestId);

    res.json(verifiedrepairRequest);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch all logistic repair requests
router.get('/verified', async (req, res) => {
  try {
    const repairlogisticrequests = await LogisticRepairVerified.find();
    res.json(repairlogisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//router to approve logistic repair request
router.post('/approve-repair/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const request = await LogisticRepairVerified.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Save to the verified collection
    const verifiedrepairRequest = new ApprovedRepairRequest(request.toObject());
    await verifiedrepairRequest.save();

    // Optionally, remove from the original collection
    await LogisticRepairVerified.findByIdAndDelete(requestId);

    res.json(verifiedrepairRequest);
  } catch (error) {
    console.error('Error verifying request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch all logistic repair requests
router.get('/repair-approved', async (req, res) => {
  try {
    const repairlogisticapproved = await ApprovedRepairRequest.find();
    res.json(repairlogisticapproved);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;
