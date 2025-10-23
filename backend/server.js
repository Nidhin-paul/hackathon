import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './config/database.js';
import contactRoutes from './routes/contactRoutes.js';
import logRoutes from './routes/logRoutes.js';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/activities', activityRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Emergency Contact Hub API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Join a room for real-time updates
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Handle panic alerts
  socket.on('panic:alert', (data) => {
    console.log('Panic alert received:', data);
    // Broadcast to all connected clients (especially admins)
    io.emit('panic:alert', {
      message: data.message,
      timestamp: data.timestamp,
      socketId: socket.id,
    });
  });

  // Handle user category selections
  socket.on('user:category-selected', async (data) => {
    console.log('User category selected:', data);
    
    try {
      // Save to database
      const UserActivity = (await import('./models/UserActivity.js')).default;
      const activity = new UserActivity({
        userName: data.user.name,
        userEmail: data.user.email,
        userId: data.user.id,
        category: data.category,
        location: data.location,
        timestamp: data.timestamp || new Date(),
      });
      
      await activity.save();
      console.log('User activity saved to database:', activity._id);
    } catch (error) {
      console.error('Error saving user activity to database:', error);
    }
    
    // Broadcast to all connected clients (especially admins)
    io.emit('user:category-selected', {
      user: data.user,
      category: data.category,
      timestamp: data.timestamp,
      location: data.location,
      socketId: socket.id,
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Socket.IO server is ready`);
});
