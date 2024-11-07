
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



router.get('/profile', authMiddleware, async (req, res) => {

  try {

    const user = await User.findById(req.userId);

    if (!user) return res.status(404).send('User  not found');

    res.json(user);

  } catch (err) {

    res.status(500).send(err.message);

  }

});
router.put('/update-profile', authMiddleware, async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });

    if (!user) return res.status(404).send('User  not found');

    res.json(user);

  } catch (err) {

    res.status(500).send(err.message);

  }

});

module.exports = router;