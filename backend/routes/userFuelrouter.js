// fetching for view requisition by it ID
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';
const authMiddleware = require('../middlewares/userAthu')
const ApprovedFuelRequest = require ('../models/approvedfuelRequest')
const RecievedFuelRequest = require ('../models/fuelRequestRecieved')
const RejectedFuelRequest = require('../models/rejectuserfuelRequest'); 


  router.get('/', authMiddleware, async (req, res) => {
    try {
      const userId = req.userId; // Ensure userId is an ObjectId
  
      // Query by userId and status
      const requestfuelApproved = await ApprovedFuelRequest.find({ userId: userId });
  
      if (!requestfuelApproved || requestfuelApproved.length === 0) {
        return res.status(404).json({ message: 'No approved requests found for this user.' });
      }
     
      res.json(requestfuelApproved);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: error.message });
    }
  });  

// to fetch all approved user fuel requisition 
  router.get('/approveduserfuel', async (req, res) => {
    try {
      // Fetch all approved fuel requests
      const requestfuelApproved = await ApprovedFuelRequest.find();
  
      if (!requestfuelApproved || requestfuelApproved.length === 0) {
        return res.status(404).json({ message: 'No approved requests found.' });
      }
  
      res.json(requestfuelApproved);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: error.message });
    }
  });

// Get rejected requisitions for perticular user

router.get('/rejectedfueluser',authMiddleware, async (req, res) => {
  try {

    const userId = req.userId;
    
    const rejectedUserFuelRequests = await RejectedFuelRequest.find({ userId: userId });

    if (!rejectedUserFuelRequests || rejectedUserFuelRequests.length === 0) {
      return res.status(404).json({ message: 'No rejected requests found on this user' });
    }

    res.json(rejectedUserFuelRequests); // Sends the correct data variable
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all rejected requisitions

router.get('/rejectedfuel', async (req, res) => {
  try {
    const rejectedFuelRequests = await RejectedFuelRequest.find();

    if (!rejectedFuelRequests || rejectedFuelRequests.length === 0) {
      return res.status(404).json({ message: 'No rejected requests found.' });
    }

    res.json(rejectedFuelRequests); // Sends the correct data variable
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET single rejected request by ID
router.get('/rejected/:id', async (req, res) => {
  try {
    const rejectedRequest = await RejectedFuelRequest.findById(req.params.id);

    if (!rejectedRequest) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    res.json(rejectedRequest);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: error.message });
  }
});

// get all received fuel requisitions for the logged-in user
router.get('/recievedfuel', authMiddleware, async (req, res) => {
  try {
    const receivedFuelRequest = await RecievedFuelRequest.find({ userId: req.userId }); // Assuming each requisition has a userId field

    if (!receivedFuelRequest || receivedFuelRequest.length === 0) {
      return res.status(404).json({ message: 'No received requests found for you.' });
    }

    res.json(receivedFuelRequest);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});
  // get all recieved fuel requestion 
  router.get('/recievedfuel', async (req, res) => {
    try {
     
      const recievedFuelRequest = await RecievedFuelRequest.find();
  
      if (!recievedFuelRequest || recievedFuelRequest.length === 0) {
        return res.status(404).json({ message: 'No recieved fuel requesition found in system.' });
      }
     
      res.json(recievedFuelRequest);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: error.message });
    }
  });

  router.get('/receivedfuel/:id', async (req, res) => {
    try {
      const recievedFuelRequest = await RecievedFuelRequest.findById(req.params.id);
      res.json(recievedFuelRequest);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// Update quantity received

router.put('/:id', async (req, res) => {

  try {

    const { quantityReceived } = req.body;

    const updatedRequest = await ApprovedFuelRequest.findByIdAndUpdate(

      req.params.id,

      { quantityReceived },

      { new: true } // Return the updated document

    );


    if (!updatedRequest) {

      return res.status(404).json({ message: 'Request not found' });

    }
    res.json(updatedRequest);

  } catch (error) {

    console.error('Error updating quantity received:', error);

    res.status(500).json({ message: error.message });

  }

});



router.get('/:id', async (req, res) => {
    try {
      const requestfuelApproved = await ApprovedFuelRequest.findById(req.params.id);
      res.json(requestfuelApproved);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


router.get('/recievedfuel', authMiddleware, async (req, res) => {
    try {
      const userId = req.userId; // Ensure userId is an ObjectId
  
      // Query by userId and status
      const recievedFuelRequest = await RecievedFuelRequest.find({ userId: userId });
  
      if (!recievedFuelRequest || recievedFuelRequest.length === 0) {
        return res.status(404).json({ message: 'No approved requests found for this user.' });
      }
     
      res.json(recievedFuelRequest);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: error.message });
    }
  });  




  // Reject requisition
router.post('/reject/:id', async (req, res) => {
  try {
    const requestToReject = await ApprovedFuelRequest.findById(req.params.id);
    
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
    await ApprovedFuelRequest.findByIdAndDelete(req.params.id); // Optionally delete the original request

    res.json({ message: 'Requisition rejected successfully!' });
  } catch (error) {
    console.error('Error rejecting requisition:', error);
    res.status(500).json({ message: error.message });
  }
});





  module.exports = router;