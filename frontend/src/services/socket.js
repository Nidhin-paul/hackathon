import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://hackathon-g5qv.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected:', this.socket.id);
      return this.socket;
    }

    console.log('Connecting to socket server:', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }

    // Store the listener
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Contact-specific methods
  onContactCreated(callback) {
    this.on('contact:created', callback);
  }

  onContactUpdated(callback) {
    this.on('contact:updated', callback);
  }

  onContactDeleted(callback) {
    this.on('contact:deleted', callback);
  }

  offContactCreated(callback) {
    this.off('contact:created', callback);
  }

  offContactUpdated(callback) {
    this.off('contact:updated', callback);
  }

  offContactDeleted(callback) {
    this.off('contact:deleted', callback);
  }

  // Panic alert methods
  emitPanicAlert(data) {
    console.log('📤 Emitting panic:alert event with data:', data);
    if (!this.socket) {
      console.error('❌ Socket not connected! Connecting now...');
      this.connect();
    }
    this.emit('panic:alert', data);
    console.log('✅ Panic alert emitted');
  }

  onPanicAlert(callback) {
    console.log('👂 Registering panic:alert listener');
    if (!this.socket) {
      console.log('Socket not connected, connecting now...');
      this.connect();
    }
    this.on('panic:alert', callback);
    console.log('✅ Panic alert listener registered');
  }

  offPanicAlert(callback) {
    console.log('🔇 Removing panic:alert listener');
    this.off('panic:alert', callback);
  }

  // User category selection methods
  onUserCategorySelected(callback) {
    this.on('user:category-selected', callback);
  }

  offUserCategorySelected(callback) {
    this.off('user:category-selected', callback);
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
