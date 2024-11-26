
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/userAthu')
const User = require('../models/user');
//const middleware= require('../middlewares/userAthu')
const upload = require('../middlewares/upload');
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads (signatures)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/signatures/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});


// Update user route with signature upload
router.put('/:id', upload.single('signature'), async (req, res) => {
  try {
    const { positionName, serviceName, departmentName, firstName, lastName, phone, email, role } = req.body;
    const userId = req.params.id;
    let updateData = {
      firstName,
      lastName,
      phone,
      email,
      role,
      positionName,
      departmentName,
      serviceName
    };
  
    // If a file is uploaded, add the path to updateData
    if (req.file) {
      updateData.signature = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
