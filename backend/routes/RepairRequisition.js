const express = require('express');
const router = express.Router();
const RepairRequisition = require('../models/RepairRequisition'); // Adjust the path as necessary

// Route to handle form submission
router.post('/repair-submit', async (req, res) => {
  const {
    department,
    desitination,
    carplaque,
    unit,
    quantityRequested,
    pricePerUnit,
    totalPrice,
    totalOverallPrice,
    date,
    hodName,
    hodSignature
  } = req.body;

  try {
    const newRequisition = new RepairRequisition({
      department,
      desitination,
      carplaque,
      unit,
      quantityRequested,
      pricePerUnit,
      totalPrice,
      totalOverallPrice,
      date,
      hodName,
      hodSignature
    });
    console.log(req.body); 

    await newRequisition.save();
    res.status(201).json({ message: 'Requisition submitted successfully' });
  } catch (error) {
    console.error('Error submitting requisition:', error);
    res.status(500).json({ message: 'Error submitting requisition', error });
  }
});

module.exports = router;
