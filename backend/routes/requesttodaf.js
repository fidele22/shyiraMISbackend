const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAthu')
const ItemRequisitionVerified = require('../models/itemRequisitionVerified');
const ApprovedRequest = require('../models/approvedRequest');
const FuelRequestVerified = require('../models/fuelRequestVerified')
const ApprovedFuelRequest = require ('../models/approvedfuelRequest')
const ItemRequisitionRejected =require('../models/itemRequisitionRejected')
const RejectedFuelRequest = require('../models/rejectuserfuelRequest')

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
// Add this in your routes file
router.post('/rejectedrequests', async (req, res) => {
  const { requisitionId } = req.body;
  try {
    // Fetch the requisition document by ID
    const requisition = await ItemRequisitionVerified.findById(requisitionId);

    if (!requisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }

    // Move the requisition to the rejected collection
    await ItemRequisitionRejected.create(requisition.toObject());

    // Remove the requisition from the forwarded collection
    await ItemRequisitionVerified.findByIdAndDelete(requisitionId);

    res.status(200).json({ message: 'Requisition rejected successfully' });
  } catch (error) {
    console.error('Error rejecting requisition:', error);
    res.status(500).json({ message: 'Failed to reject requisition' });
  }
});

router.put('/rejected/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Ensure the 'clicked' field is included if it's in the request body
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    // Find and update the request, ensuring it returns the updated document
    const updatedRequest = await ItemRequisitionVerified.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    // If no document found, return 404
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Forward the rejected request to a new collection
    const forwardData = {
      userId: updatedRequest.userId,
      department: updatedRequest.department,
      items: updatedRequest.items.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantityRequested: item.quantityRequested,
        quantityReceived: item.quantityReceived,
        observation: item.observation
      })),
      date: updatedRequest.date,
      hodName: updatedRequest.hodName,
      hodSignature: updatedRequest.hodSignature,
      logisticName: updatedRequest.logisticName,
      logisticSignature: updatedRequest.logisticSignature,
    };

    const forwardedRequest = new ItemRequisitionRejected(forwardData);
    await forwardedRequest.save();

    // Remove the original request from the ItemRequisitionVerified collection
    await ItemRequisitionVerified.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request rejected and forwarded successfully.' });
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


  // Reject fuel requisition
  router.post('/reject/:id', async (req, res) => {
    try {
      const requestToReject = await FuelRequestVerified.findById(req.params.id);
      
      if (!requestToReject) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      // Move the request to a rejected collection (you need to implement this logic)
     // Adjust the path as necessary
  
      const rejectedRequest = new RejectedFuelRequest({
        ...requestToReject._doc, 
        rejectedAt: new Date(), 
         
      });
  
      await rejectedRequest.save();
      await FuelRequestVerified.findByIdAndDelete(req.params.id); // Optionally delete the original request
  
      res.json({ message: 'Requisition rejected successfully!' });
    } catch (error) {
      console.error('Error rejecting requisition:', error);
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
