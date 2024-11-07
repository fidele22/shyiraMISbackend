const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Add this line to import jsonwebtoken
const jwtSecret = 'your_jwt_secret_key';
const { upload, registerUser, loginUser, getUsers, updateUser, deleteUser, authenticate, getProfile,updateProfile } = require('../controllers/userController');
const User = require('../models/user'); // Make sure to import your User model

router.post('/register', upload.single('signature'), registerUser);

router.post('/login', loginUser);
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Profile route
router.get('/profile', authenticate, getProfile);


// Get users with role 'logistic' with 
router.get('/logistic-users', async (req, res) => {
    try {
      const logisticUsers = await User.find({ role: 'LOGISTIC' }).select('firstName lastName signature');
      res.json(logisticUsers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching logistic users', error });
    }
  });
  // Get users with role 'daf'
router.get('/daf-users', async (req, res) => {
  try {
    const dafUsers = await User.find({ role: 'DAF' }).select('firstName lastName signature');
    res.json(dafUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logistic users', error });
  }
});
  // Get users with role 'daf'
  router.get('/DG-users', async (req, res) => {
    try {
      const dgUsers = await User.find({ role: 'DG' }).select('firstName lastName signature');
      res.json(dgUsers);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching logistic users', error });
    }
  });
  
  

module.exports = router;
