const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user'); // Adjust the path as necessary
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret';

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if the password matches the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token with user ID and role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' } // Token expires in 8 hours
    );

    // Send the token and role back to the client
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



//reseting password

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fidelehirwa23@gmail.com',
    pass: 'bmxasvhzizzctrpi ', // Use the app-specific password here
  },
});

async function sendResetPasswordEmail(email, resetLink) {
  const mailOptions = {
    from: 'fidelehirwa23@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Please use the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User with this email does not exist.');
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '8h' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await sendResetPasswordEmail(user.email, resetLink);

    res.send('Password reset link has been sent to your email.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in sending reset password link.');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(400).send('Invalid or expired token.');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.send('Password has been reset successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error resetting password.');
  }
});

module.exports = router;
