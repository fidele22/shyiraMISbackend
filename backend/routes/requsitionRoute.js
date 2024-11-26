const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';// Ensure this is included
const UserRequest = require('../models/UserRequest');
const stockItem = require('../models/stockItems');
const ItemRequisitionVerified = require('../models/itemRequisitionVerified');
const ItemRequisitionRejected = require ('../models/itemRequisitionRejected')
const RecievedRequest = require('../models/itemRequestRecieved')


const router = express.Router();

// Set up multer for file uploads if needed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { department,service, hodName, hodSignature, items, date } = req.body;

    if (!items) {
      return res.status(400).json({ error: 'Items field is missing.' });
    }

    let parsedItems;
    try {
      parsedItems = JSON.parse(items);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid items JSON format.' });
    }

    const userId = req.userId; // Extracted from token

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const validItems = [];
    for (const item of parsedItems) {
      if (!item.itemId) {
        return res.status(400).json({ error: 'Item ID is required for each item.' });
      }

      const validItem = await stockItem.findById(item.itemId);
      if (!validItem) {
        return res.status(400).json({ error: 'Invalid Item ID.' });
      }

      validItems.push({
        
        itemId: item.itemId,
        itemName: validItem.name,
        quantityRequested: item.quantityRequested,
        price: item.price,
        totalAmount: item.totalAmount
      });
    }

    const newRequest = new UserRequest({
      userId: userId,
      department,
      service,
      hodName,
      hodSignature,
      items: validItems,
      date,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Requisition created successfully!' });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// user fetch its requisition according to its ID
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Ensure userId is an ObjectId

    // Query by userId and status
    const userRequests = await UserRequest.find({ userId: userId });

    if (!userRequests || userRequests.length === 0) {
      return res.status(404).json({ message: 'No Pending requests found for this user.' });
    }
   
    res.json(userRequests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch all logistic requests
router.get('/', async (req, res) => {
  try {
    const requests = await UserRequest.find();
    res.json(requests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get the count of user requests
router.get('/count', async (req, res) => {
  try {
    const requestCount = await UserRequest.countDocuments();
    res.json({ count: requestCount });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Get all received requests for a specific user
router.get('/recieved-request', async (req, res) => {
  try {
  
    const receivedRequests = await RecievedRequest.find();

    if (receivedRequests.length === 0) {
      return res.status(404).json({ message: 'No received requests found for this user' });
    }

    res.json(receivedRequests);
  } catch (error) {
    console.error('Error fetching received requests by userId:', error);
    res.status(500).json({ message: 'Error fetching received requests', error });
  }
});
// Get all received requests for a specific user
router.get('/rejected-user-request', async (req, res) => {
  try {
  
    const rejecteduserRequests = await ItemRequisitionRejected.find();

    if (rejecteduserRequests.length === 0) {
      return res.status(404).json({ message: 'No received requests found for this user' });
    }

    res.json(rejecteduserRequests);
  } catch (error) {
    console.error('Error fetching received requests by userId:', error);
    res.status(500).json({ message: 'Error fetching received requests', error });
  }
});

// Example route to fetch a single logistic request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await UserRequest.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recieved-request/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await RecievedRequest.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/rejected-user-request/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ItemRequisitionRejected.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/verified/:id', async (req, res) => {
  try {
     // Find the request by ID
     const request = await UserRequest.findById(req.params.id);
     if (!request) {
       return res.status(404).json({ message: 'Request not found' });
     }
 
     // Update the status to 'verified'
     request.status = 'verified';
 
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Forward the updated request to another collection
    const forwardData = {
      userId: updatedRequest.userId,
      department: updatedRequest.department,
      service: updatedRequest.service,
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
   
     // updatedAt: updatedRequest.updatedAt
    };

    const forwardedRequest = new ItemRequisitionVerified(forwardData);
    await forwardedRequest.save();
    
        // Optionally, remove the user request from the UserRequest collection
    await UserRequest.findByIdAndDelete(req.params.id);
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.put('/rejected/:id', async (req, res) => {
  try {
  
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Forward the updated request to another collection
    const forwardData = {
      userId: updatedRequest.userId,
      department: updatedRequest.department,
      service: updatedRequest.service,
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
   
     // updatedAt: updatedRequest.updatedAt
    };

    const forwardedRequest = new ItemRequisitionRejected(forwardData);
    await forwardedRequest.save();
    
        // Optionally, remove the user request from the UserRequest collection
    await UserRequest.findByIdAndDelete(req.params.id);
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// fetching item name
router.get('/api/getData', async (req, res) => {
  try {
    const data = await stockItem.find({});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);  // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});




module.exports = router;
