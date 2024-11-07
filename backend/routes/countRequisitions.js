const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const jwt = require('jsonwebtoken'); 
const JWT_SECRET = 'your_jwt_secret';// Ensure this is included
const ApprovedRequest = require('../models/approvedRequest');
// Corrected count route


router.get('/number', async (req, res) => {
    try {
      const requestApprovedCount = await ApprovedRequest.countDocuments();
      res.json({ count: requestApprovedCount });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  module.exports = router;
  
  