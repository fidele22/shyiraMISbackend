const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAthu')
const ItemRequisitionVerified = require('../models/itemRequisitionVerified');
const ApprovedRequest = require('../models/approvedRequest');
const FuelRequestVerified = require('../models/fuelRequestVerified')
const ApprovedFuelRequest = require ('../models/approvedfuelRequest')



// user fetch its verified requisition according to its ID
router.get('/user-verified', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const userRequests = await ItemRequisitionVerified.find({ userId: userId });

    if (!userRequests || userRequests.length === 0) {
      return res.status(404).json({ message: 'No Verified item requests found on you.' });
    }
   
    res.json(userRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route to get the count of user requests
router.get('/count-Verified-item', async (req, res) => {
  try {
    const requestVerifiedCount = await ItemRequisitionVerified.countDocuments();
    res.json({ count: requestVerifiedCount });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/fuel', async (req, res) => {
  try {
    const fuelrequisitions = await FuelRequestVerified.find();
    res.status(200).json(fuelrequisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//getting requisition for partcular user
router.get('/user-fuel-verified', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const userFuelRequests = await FuelRequestVerified.find({ userId: userId });

    if (!userFuelRequests || userFuelRequests.length === 0) {
      return res.status(404).json({ message: 'No Verified fuel requests found on you.' });
    }
   
    res.json(userFuelRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});


// Fetch all verified requests
router.get('/items', async (req, res) => {
  try {
    const requests = await ItemRequisitionVerified.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Fetch a specific verified by  request ID
router.get('/:id', async (req, res) => {
  try {
    const request = await ItemRequisitionVerified.findById(req.params.id);
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/fuel/:id', async (req, res) => {
  try {
    const request = await FuelRequestVerified.findById(req.params.id);
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a forwarded item  requisition
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await ItemRequisitionVerified.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forward a request to the approved collection
router.post('/approved/:id', async (req, res) => {
  try {
    const forwardedRequest = await ItemRequisitionVerified.findById(req.params.id);
    
    if (!forwardedRequest) {
      return res.status(404).json({ message: 'Forwarded request not found' });
    }
    
    // Create a new approved request and include the userId
    const approvedRequest = new ApprovedRequest({
      userId: forwardedRequest.userId, // Include userId from forwarded request
      department: forwardedRequest.department,
      items: forwardedRequest.items,
      hodName: forwardedRequest.hodName,
      hodSignature: forwardedRequest.hodSignature,
      date: forwardedRequest.date,
      clicked: req.body.clicked || false // Use the clicked status if provided, else default to false
    });

    await approvedRequest.save();

          // Optionally, remove the user request from the UserRequest collection
    await ItemRequisitionVerified.findByIdAndDelete(req.params.id);

    res.status(201).json(approvedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update and forward on another collection a fuel requisition by ID
router.put('/updatefuel/:id', async (req, res) => {
  try {
    const updatedVerifiedRequisition = await FuelRequestVerified.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVerifiedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }


    await updatedVerifiedRequisition.save();

    res.status(200).json(updatedVerifiedRequisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Route to verify and forward a fuel requisition by ID
router.post('/approvefuel/:id', async (req, res) => {
  try {
    const updatedVerifiedRequisition = await FuelRequestVerified.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVerifiedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }

    // Forward the updated requisition to the approved  collection
    const approvedfuel = new ApprovedFuelRequest({
      ...updatedVerifiedRequisition.toObject(),
      originalRequisitionId: updatedVerifiedRequisition._id,
    });

    await approvedfuel.save();

     // Optionally, remove the user request from the UserRequest collection
     await FuelRequestVerified.findByIdAndDelete(req.params.id);
    res.status(200).json(updatedVerifiedRequisition);
  } catch (error) {
    console.error('Error verifying requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
