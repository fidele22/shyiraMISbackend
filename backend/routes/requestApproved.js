const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';// Ensure this is included
const ApprovedRequest = require('../models/approvedRequest');
const RecievedRequest = require('../models/itemRequestRecieved')
const RejectedRequest =require ('../models/itemRequisitionRejected')
const ApprovedFuelRequest = require ('../models/approvedfuelRequest')
const RecievedFuelRequest = require ('../models/fuelRequestRecieved')
const UserRequest =require ('../models/UserRequest')
const verifiedRequest =require ('../models/itemRequisitionVerified')

// Repost approved request to received collection
router.post('/receive/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the approved request by ID
    const approvedRequest = await ApprovedRequest.findById(requestId);
    if (!approvedRequest) {
      return res.status(404).json({ message: 'Approved request not found' });
    }

    // Create a new received request document with the approved request data
    const receivedRequest = new RecievedRequest({
      userId: approvedRequest.userId,
      department: approvedRequest.department,
      items: approvedRequest.items,
      hodName: approvedRequest.hodName,
      hodSignature: approvedRequest.hodSignature,
      clicked: true,
    });

    // Save the received request to the database
    await receivedRequest.save();

    // Optionally, remove the approved request from the ApprovedRequest collection
    await ApprovedRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: 'Request marked as received and saved to received collection' });
  } catch (error) {
    console.error('Error reposting approved request:', error);
    res.status(500).json({ message: 'Error marking request as received', error });
  }
});


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
router.get('/approved', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const approvedRequests = await ApprovedRequest.find({ userId: userId });

    if (!approvedRequests || approvedRequests.length === 0) {
      return res.status(404).json({ message: 'No approved requests found for this user.' });
    }
   
    res.json(approvedRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});
  // Get all rejected requests for a specific user
  router.get('/rejected-request',authMiddleware, async (req, res) => {
    try {
      const userId = req.userId; 
      const rejectedRequests = await RejectedRequest.find({ userId: userId });
  
      if (rejectedRequests.length === 0) {
        return res.status(404).json({ message: 'No rejected requests found for this user' });
      }
  
      res.json(rejectedRequests);
    } catch (error) {
      console.error('Error fetching received requests by userId:', error);
      res.status(500).json({ message: 'Error fetching received requests', error });
    }
  });
     // Get all received requests for a specific user
     router.get('/recieved',authMiddleware, async (req, res) => {
      try {
        const userId = req.userId; 
        const receivedRequests = await RecievedRequest.find({ userId: userId });
    
        if (receivedRequests.length === 0) {
          return res.status(404).json({ message: 'No Recieved item requesition found on you' });
        }
    
        res.json(receivedRequests);
      } catch (error) {
        console.error('Error fetching received requests by userId:', error);
        res.status(500).json({ message: 'Error fetching received requests', error });
      }
    });
  router.get('/rejected/:id', async (req, res) => {
    try {
      const requestId = req.params.id;
      const request = await RejectedRequest.findById(requestId); // Assuming Mongoose model
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
    // get approved one by one according to it ID
    router.get('/:id', async (req, res) => {
      try {
        const requestId = req.params.id;
        const request = await ApprovedRequest.findById(requestId); // Assuming Mongoose model
        if (!request) {
          return res.status(404).json({ message: 'Request not found' });
        }
        res.json(request);
      } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
  
//
  // Get all approved requests
 router.get('/', async (req, res) => {
   try {
     const approvedRequests = await ApprovedRequest.find();
     res.json(approvedRequests);
   } catch (error) {
     res.status(500).json({ message: 'Error fetching approved requests', error });
   }
 });



  // Get counts for user dashboard
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Assuming user ID is available in req.user

    // Count user requests
    const requestCount = await UserRequest.countDocuments({ userId: userId });

    // Count approved requests
    const approvedCount = await ApprovedRequest.countDocuments({ userId: userId });

    const verifiedCount = await verifiedRequest.countDocuments({ userId: userId });
    res.json({
      requestCount,
      approvedCount,
      verifiedCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to verify and forward a fuel requisition by ID
router.post('/fuel-recieved/:id', async (req, res) => {
  try {
    const updatedRequisition = await ApprovedFuelRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRequisition) {
      return res.status(404).json({ message: 'Requisition not found' });
    }

    // Forward the updated requisition to the forwarded collection
    const forwardedData = new RecievedFuelRequest({
      ...updatedRequisition.toObject(),
      originalRequisitionId: updatedRequisition._id,
    });

    await forwardedData.save();

    res.status(200).json(updatedRequisition);
  } catch (error) {
    console.error('Error verifying requisition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

  module.exports = router;