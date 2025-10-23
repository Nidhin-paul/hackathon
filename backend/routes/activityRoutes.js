import express from 'express';
import UserActivity from '../models/UserActivity.js';

const router = express.Router();

// Get all user activities (with pagination and filtering)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, userId } = req.query;
    
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (userId) {
      query.userId = userId;
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await UserActivity.countDocuments(query);

    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Error fetching user activities', error: error.message });
  }
});

// Create a new user activity
router.post('/', async (req, res) => {
  try {
    const { userName, userEmail, userId, category, location, timestamp } = req.body;

    const activity = new UserActivity({
      userName,
      userEmail,
      userId,
      category,
      location,
      timestamp: timestamp || new Date(),
    });

    const savedActivity = await activity.save();

    // Emit socket event to notify admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.emit('user:category-selected', {
        user: {
          name: userName,
          email: userEmail,
          id: userId,
        },
        category,
        timestamp: savedActivity.timestamp,
        location,
      });
    }

    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Error creating user activity:', error);
    res.status(500).json({ message: 'Error creating user activity', error: error.message });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const totalActivities = await UserActivity.countDocuments();
    
    const categoryCounts = await UserActivity.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const recentActivities = await UserActivity.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    res.json({
      totalActivities,
      categoryCounts: categoryCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Error fetching activity stats', error: error.message });
  }
});

// Delete an activity by ID
router.delete('/:id', async (req, res) => {
  try {
    const activity = await UserActivity.findByIdAndDelete(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json({ message: 'Activity deleted successfully', activity });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Error deleting activity', error: error.message });
  }
});

export default router;
