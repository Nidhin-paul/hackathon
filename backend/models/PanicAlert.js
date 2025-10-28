import mongoose from 'mongoose';

const panicAlertSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    default: 'PANIC BUTTON PRESSED!'
  },
  user: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  location: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    },
    address: {
      type: String,
      required: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  acknowledgedBy: {
    type: String,
    required: false
  },
  acknowledgedAt: {
    type: Date,
    required: false
  },
  resolvedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for faster queries
panicAlertSchema.index({ createdAt: -1 });
panicAlertSchema.index({ status: 1 });
panicAlertSchema.index({ 'user.id': 1 });

const PanicAlert = mongoose.model('PanicAlert', panicAlertSchema);

export default PanicAlert;
