import express from 'express';
import EmergencyContact from '../models/EmergencyContact.js';

const router = express.Router();

// Get all emergency contacts
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const contacts = await EmergencyContact.find(query).sort({ isPredefined: -1, createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new emergency contact
router.post('/', async (req, res) => {
  try {
    const contact = new EmergencyContact(req.body);
    const newContact = await contact.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('contact:created', newContact);
    
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update emergency contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Prevent updating predefined contacts
    if (contact.isPredefined) {
      return res.status(403).json({ message: 'Cannot update predefined contacts' });
    }
    
    Object.assign(contact, req.body);
    const updatedContact = await contact.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('contact:updated', updatedContact);
    
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete emergency contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Prevent deleting predefined contacts
    if (contact.isPredefined) {
      return res.status(403).json({ message: 'Cannot delete predefined contacts' });
    }
    
    const contactId = contact._id;
    await contact.deleteOne();
    
    // Emit real-time event
    const io = req.app.get('io');
    io.emit('contact:deleted', { _id: contactId });
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
