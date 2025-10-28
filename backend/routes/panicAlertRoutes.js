import express from 'express';
import PanicAlert from '../models/PanicAlert.js';

const router = express.Router();

// Get all panic alerts
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const alerts = await PanicAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Error fetching panic alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching panic alerts',
      error: error.message
    });
  }
});

// Get single panic alert by ID
router.get('/:id', async (req, res) => {
  try {
    const alert = await PanicAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Panic alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching panic alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching panic alert',
      error: error.message
    });
  }
});

// Create new panic alert
router.post('/', async (req, res) => {
  try {
    const { message, user, location } = req.body;
    
    // Validation
    if (!user || !user.name || !user.email || !user.id) {
      return res.status(400).json({
        success: false,
        message: 'User information is required (name, email, id)'
      });
    }
    
    const alert = new PanicAlert({
      message: message || 'PANIC BUTTON PRESSED!',
      user,
      location: location || null,
      status: 'active'
    });
    
    const savedAlert = await alert.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('panic:alert', savedAlert);
    }
    
    res.status(201).json({
      success: true,
      message: 'Panic alert created successfully',
      data: savedAlert
    });
  } catch (error) {
    console.error('Error creating panic alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating panic alert',
      error: error.message
    });
  }
});

// Update panic alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, acknowledgedBy } = req.body;
    
    if (!status || !['active', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, acknowledged, resolved)'
      });
    }
    
    const alert = await PanicAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Panic alert not found'
      });
    }
    
    alert.status = status;
    
    if (status === 'acknowledged' && acknowledgedBy) {
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
    
    if (status === 'resolved') {
      alert.resolvedAt = new Date();
    }
    
    const updatedAlert = await alert.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('panic:updated', updatedAlert);
    }
    
    res.json({
      success: true,
      message: 'Panic alert status updated',
      data: updatedAlert
    });
  } catch (error) {
    console.error('Error updating panic alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating panic alert',
      error: error.message
    });
  }
});

// Delete panic alert
router.delete('/:id', async (req, res) => {
  try {
    const alert = await PanicAlert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Panic alert not found'
      });
    }
    
    await alert.deleteOne();
    
    res.json({
      success: true,
      message: 'Panic alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting panic alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting panic alert',
      error: error.message
    });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAlerts = await PanicAlert.countDocuments();
    const activeAlerts = await PanicAlert.countDocuments({ status: 'active' });
    const acknowledgedAlerts = await PanicAlert.countDocuments({ status: 'acknowledged' });
    const resolvedAlerts = await PanicAlert.countDocuments({ status: 'resolved' });
    
    res.json({
      success: true,
      data: {
        total: totalAlerts,
        active: activeAlerts,
        acknowledged: acknowledgedAlerts,
        resolved: resolvedAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching panic alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;
