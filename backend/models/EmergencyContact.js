import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['police', 'fire', 'medical', 'ambulance', 'disaster', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    address: {
      type: String,
      trim: true
    }
  },
  isPredefined: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

export default EmergencyContact;
