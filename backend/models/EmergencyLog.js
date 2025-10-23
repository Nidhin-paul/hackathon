import mongoose from 'mongoose';

const emergencyLogSchema = new mongoose.Schema({
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact',
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  userLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    address: {
      type: String
    }
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['initiated', 'in-progress', 'resolved'],
    default: 'initiated'
  }
}, {
  timestamps: true
});

const EmergencyLog = mongoose.model('EmergencyLog', emergencyLogSchema);

export default EmergencyLog;
