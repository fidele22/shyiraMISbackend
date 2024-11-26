const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const Item = require('../models/stockItems');
const LogisticRequest = require('../models/requestOfLogistic');
const VerifiedLogisticRequest = require ('../models/logisticRequestVerified')
const ApprovedLogisticRequest =require('../models/approvedLogisticRequest')
const RecievedLogisticRequest = require('../models/recievedLogisticRequest')
const RejectedItemOrder = require('../models/logisticItemRejected')



// fetching item name
router.get('/api/getData', async (req, res) => {
  try {
    const data = await Item.find({});
    res.status(200).send(data);
  } catch (error) {
    console.error(error);  // Log the error
    res.status(500).send({ success: false, error: error.message });
  }
});

// Apply the multer middleware to handle form data
router.post('/submit', upload.none(), async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body

    const { supplierName, items, date } = req.body;

    // Ensure items is defined and a valid JSON string
    if (!items) {
      throw new Error('Items field is missing.');
    }

    // Validate items
    const parsedItems = JSON.parse(items); // Assuming items is a JSON string

    console.log('Parsed Items:', parsedItems); // Log parsed items

    const validItems = await Promise.all(parsedItems.map(async item => {
      if (!item.itemId) {
        throw new Error('Item ID is required for each item.');
      }

      // Ensure itemId is valid
      const validItem = await Item.findById(item.itemId);
      if (!validItem) {
        throw new Error('Invalid Item ID.');
      }

      return {
        itemId: item.itemId,
        itemName: item.itemName,
        quantityRequested: item.quantityRequested,
        price: item.price,
        totalAmount: item.totalAmount
      };
    }));

    // Create userRequest
    const newRequest = new LogisticRequest({
      supplierName,
      items: validItems,
      date,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Requisition created successfully!' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Route to fetch all logistic requests
router.get('/', async (req, res) => {
  try {
    const logisticrequests = await LogisticRequest.find();
    res.json(logisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Route to fetch all logistic requests
router.get('/verified', async (req, res) => {
  try {
    const logisticrequests = await VerifiedLogisticRequest.find();
    res.json(logisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//router to fetch approved logistic request from approved 
router.get('/approved-order', async (req, res) => {
  try {
    const approvedlogisticrequests = await ApprovedLogisticRequest.find();
    res.json(approvedlogisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//router to fetch received logistic request from recievedlogistci request collection
router.get('/received-order', async (req, res) => {
  try {
    const receivedlogisticrequests = await RecievedLogisticRequest.find();
    res.json(receivedlogisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
//router to fetch received logistic request from recievedlogistci request collection
router.get('/rejected-item-order', async (req, res) => {
  try {
    const receivedlogisticrequests = await RejectedItemOrder.find();
    res.json(receivedlogisticrequests);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/rejected-item-order/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await RejectedItemOrder.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Example route to fetch a single logistic request by ID
router.get('/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await LogisticRequest.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  route to fetch a single logistic order by ID
router.get('/approved/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await ApprovedLogisticRequest.findById(requestId); // Assuming Mongoose model
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  route to fetch a single logistic order by ID
router.get('/received/:id', async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await RecievedLogisticRequest.findById(requestId); // Assuming Mongoose model
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

    const updatedRequest = await LogisticRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/update-verified/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Ensure clicked field is updated
    if (req.body.clicked !== undefined) {
      updateData.clicked = req.body.clicked;
    }

    const updatedRequest = await VerifiedLogisticRequest.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Forward a request to the approved collection
router.post('/verified/:id', async (req, res) => {
  try {
    const forwardedRequest = await LogisticRequest.findById(req.params.id);
    
    if (!forwardedRequest) {
      return res.status(404).json({ message: 'Forwarded request not found' });
    }
    
    // Create a new approved request and include the userId
    const approvedRequest = new VerifiedLogisticRequest({
     // userId: forwardedRequest.userId, // Include userId from forwarded request
      supplierName: forwardedRequest.supplierName,
      items: forwardedRequest.items,
      date: forwardedRequest.date,
     // clicked: req.body.clicked || false // Use the clicked status if provided, else default to false
    });

    await approvedRequest.save();

    // Optionally, remove the user request from the UserRequest collection
         await LogisticRequest.findByIdAndDelete(req.params.id);

         
    res.status(201).json(approvedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Forward a request to the approved collection
router.post('/approved/:id', async (req, res) => {
  try {
    const forwardedRequest = await VerifiedLogisticRequest.findById(req.params.id);
    
    if (!forwardedRequest) {
      return res.status(404).json({ message: 'Forwarded request not found' });
    }
    
    // Create a new approved request and include the userId
    const approvedRequest = new ApprovedLogisticRequest({
     // userId: forwardedRequest.userId, // Include userId from forwarded request
      supplierName: forwardedRequest.supplierName,
      items: forwardedRequest.items,
      date: forwardedRequest.date,
     // clicked: req.body.clicked || false // Use the clicked status if provided, else default to false
    });

    await approvedRequest.save();

         // Optionally, remove the user request from the UserRequest collection
   await VerifiedLogisticRequest.findByIdAndDelete(req.params.id);


    res.status(201).json(approvedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forward a request to the received order collection
router.post('/received/:id', async (req, res) => {
  try {
    const forwardedRequest = await ApprovedLogisticRequest.findById(req.params.id);
    
    if (!forwardedRequest) {
      return res.status(404).json({ message: 'Forwarded request not found' });
    }
    
    // Create a new approved request and include the userId
    const receivedLogisticRequest = new RecievedLogisticRequest({
     // userId: forwardedRequest.userId, // Include userId from forwarded request
      supplierName: forwardedRequest.supplierName,
      items: forwardedRequest.items,
      date: forwardedRequest.date,
     // clicked: req.body.clicked || false // Use the clicked status if provided, else default to false
    });

    await receivedLogisticRequest.save();

             // Optionally, remove the user request from the UserRequest collection
   await ApprovedLogisticRequest.findByIdAndDelete(req.params.id);

    res.status(201).json(receivedLogisticRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject a logistic item request

router.post('/rejectItemOrder/:id', async (req, res) => {

  try {

    const requestId = req.params.id;
    const requestToReject = await LogisticRequest.findById(requestId);
    if (!requestToReject) {

      return res.status(404).json({ message: 'Request not found' });

    }
    // Create a new rejected request document

    const rejectedRequest = new RejectedItemOrder({
      date: requestToReject.date,
      supplierName: requestToReject.supplierName,
      items: requestToReject.items,
      logisticSignature: requestToReject.logisticSignature,

    });


    // Save the rejected request

    await rejectedRequest.save();
    await LogisticRequest.findByIdAndDelete(requestId);
    res.status(200).json({ message: 'Request rejected successfully' });

  } catch (error) {

    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error' });

  }

});


router.post('/repair', async (req, res) => {
  try {
    const {
      department,
      items,  // Now handling items
      date,
      hodName,
      hodSignature
    } = req.body;

    items.forEach(item => {
      item.totalPrice = item.quantityRequested * item.pricePerUnit;
    });
    
    const newRequisition = new RepairRequisition({
      department,
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


module.exports = router;



