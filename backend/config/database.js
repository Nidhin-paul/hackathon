import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed predefined emergency contacts if database is empty
    await seedPredefinedContacts();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedPredefinedContacts = async () => {
  try {
    const EmergencyContact = (await import('../models/EmergencyContact.js')).default;
    const count = await EmergencyContact.countDocuments({ isPredefined: true });
    
    if (count === 0) {
      const predefinedContacts = [
        {
          name: 'Police Emergency',
          phone: '100',
          category: 'police',
          description: 'Emergency police services',
          isPredefined: true
        },
        {
          name: 'Fire Department',
          phone: '101',
          category: 'fire',
          description: 'Fire emergency services',
          isPredefined: true
        },
        {
          name: 'Ambulance',
          phone: '102',
          category: 'ambulance',
          description: 'Medical emergency ambulance services',
          isPredefined: true
        },
        {
          name: 'Disaster Management',
          phone: '108',
          category: 'disaster',
          description: 'Disaster management services',
          isPredefined: true
        },
        {
          name: 'Women Helpline',
          phone: '1091',
          category: 'police',
          description: 'Women in distress helpline',
          isPredefined: true
        },
        {
          name: 'Child Helpline',
          phone: '1098',
          category: 'other',
          description: 'Child helpline services',
          isPredefined: true
        }
      ];
      
      await EmergencyContact.insertMany(predefinedContacts);
      console.log('Predefined emergency contacts seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding predefined contacts:', error);
  }
};

export default connectDB;
