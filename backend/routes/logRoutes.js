import express from 'express';
import EmergencyLog from '../models/EmergencyLog.js';

const router = express.Router();

// Get all emergency logs
router.get('/', async (req, res) => {
  try {
    const logs = await EmergencyLog.find()
      .populate('contactId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await EmergencyLog.findById(req.params.id).populate('contactId');
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new emergency log
router.post('/', async (req, res) => {
  try {
    const log = new EmergencyLog(req.body);
    const newLog = await log.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update log status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const log = await EmergencyLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    log.status = status;
    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete log
router.delete('/:id', async (req, res) => {
  try {
    const log = await EmergencyLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    await log.deleteOne();
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
