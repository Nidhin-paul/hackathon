import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['police', 'fire', 'medical', 'ambulance', 'disaster', 'other'],
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userActivitySchema.index({ timestamp: -1 });
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ category: 1 });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
