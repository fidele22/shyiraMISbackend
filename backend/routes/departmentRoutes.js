// routes/department.js
const express = require('express');
const router = express.Router();
const Department = require('../models/department');

// POST /api/departments
router.post('/addDepart', async (req, res) => {
  try {
    const { name, description } = req.body;
    const department = new Department({ name, description });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /api/positions - Fetch all positions
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
   
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Server error' });
    
  }
});

// Update position
// PUT /api/positions/:id - Update position
router.put('/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.json(position);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete position
router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.json({ message: 'Position deleted' });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
module.exports = router;
