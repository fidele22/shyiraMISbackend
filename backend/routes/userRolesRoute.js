
const express = require('express');
const router = express.Router();
const UserRole = require('../models/userRoles');

// POST /api/services - Create a new service
router.post('/addRole', async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = new UserRole({ name, description });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services - Fetch all services
router.get('/', async (req, res) => {
  try {
    const roles = await UserRole.find();
    res.status(200).json(roles);
   
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Server error' });
    
  }
});

// PUT /api/positions/:id - Update position
router.put('/:id', async (req, res) => {
  try {
    const roles = await UserRole.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!roles) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.json(roles);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete position
router.delete('/:id', async (req, res) => {
  try {
    const roles = await UserRole.findByIdAndDelete(req.params.id);
    if (!roles) {
      return res.status(404).json({ message: 'service not found' });
    }
    res.json({ message: 'service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
