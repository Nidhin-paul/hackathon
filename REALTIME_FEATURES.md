# Real-Time Features

This project now includes real-time functionality using Socket.IO, allowing multiple users to see live updates across all connected clients.

## Features

### 🔴 Live Updates
- **Contact Creation**: When a user adds a new emergency contact, all connected clients see it instantly
- **Contact Updates**: Changes to existing contacts are reflected in real-time
- **Contact Deletion**: Deleted contacts are removed from all clients immediately

### 🔔 Real-Time Notifications
- Toast notifications appear when contacts are added, updated, or deleted
- Different notification types (success, info, error) with color coding
- Auto-dismiss after 3 seconds with manual close option

### 🌐 WebSocket Connection
- Automatic connection to Socket.IO server on dashboard load
- Reconnection handling with exponential backoff
- Connection status logging in console

## Technical Implementation

### Backend (Socket.IO Server)
- **Location**: `backend/server.js`
- **Events Emitted**:
  - `contact:created` - When a new contact is added
  - `contact:updated` - When a contact is modified
  - `contact:deleted` - When a contact is removed

### Frontend (Socket.IO Client)
- **Service**: `src/services/socket.js`
- **Component**: `src/components/Notification.jsx`
- **Integration**: `src/pages/Dashboard.jsx`

### Events Flow
```
User Action → API Call → Database Update → Socket.IO Emit → All Clients Receive → UI Updates
```

## Configuration

### Backend Environment Variables
Add to your `backend/.env` file:
```env
CLIENT_URL=http://localhost:5173
```

### Frontend Environment Variables (Optional)
Add to your `.env` file if using a different backend URL:
```env
VITE_API_URL=http://localhost:5000
```

## Testing Real-Time Features

1. **Open Multiple Browser Windows**:
   - Open the dashboard in 2+ browser windows/tabs
   - Navigate to `/dashboard` in each

2. **Test Contact Creation**:
   - In one window, click "Add Contact"
   - Fill in the form and submit
   - Watch the new contact appear in all windows instantly
   - See the success notification in all windows

3. **Test Contact Updates**:
   - Edit a contact in one window
   - See the changes reflected in all other windows
   - Notification appears in all windows

4. **Test Contact Deletion**:
   - Delete a contact in one window
   - Watch it disappear from all windows
   - Notification appears in all windows

## Socket.IO Connection Status

Check the browser console to see connection status:
- `Socket connected: [socket-id]` - Successfully connected
- `Socket disconnected` - Connection lost
- `Socket connection error: [error]` - Connection failed

## Benefits

✅ **Multi-User Collaboration**: Multiple users can work simultaneously  
✅ **Instant Updates**: No need to refresh the page  
✅ **Better UX**: Users always see the latest data  
✅ **Real-Time Notifications**: Immediate feedback on all actions  
✅ **Scalable**: Socket.IO handles many concurrent connections efficiently

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client 1  │◄───────►│  Socket.IO  │◄───────►│   Client 2  │
│  Dashboard  │         │   Server    │         │  Dashboard  │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                        │
       │                       │                        │
       ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                      │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

- 🔐 User authentication and authorization
- 👥 User presence (show who's online)
- 💬 Real-time chat for emergency coordination
- 📍 Live location tracking updates
- 🚨 Emergency alert broadcasting
- 📊 Real-time analytics dashboard
