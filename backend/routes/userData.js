const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middlewares/userAthu')
const bcrypt = require('bcrypt');

// Middleware for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads/');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// GET profile route
router.get('/get', authenticate, async (req, res) => {
    try {
        const userId = req.user.id; // Access the user ID from the request
        const user = await User.findById(userId).select('-password'); // Fetch user data excluding password
        res.json(user); // Respond with user data
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
// PUT profile route (update)
router.put('/profile', [authenticate, upload.single('signature')], async (req, res) => {
  try {
    const { firstName, lastName, phone, positionName, serviceName, departmentName } = req.body;

    const updatedData = {
      firstName,
      lastName,
      phone,
      positionName,
      serviceName,
      departmentName,
    };

    // If a new signature file is uploaded
    if (req.file) {
      updatedData.signature = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updatedData, { new: true });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
