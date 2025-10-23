# 🚨 Emergency Contact Hub

A modern, full-stack web application for quick access to emergency services with real-time location tagging. Built with React, Node.js, Express, and MongoDB.

## ✨ Features

- 🚓 **Predefined Emergency Contacts** - Quick access to police, fire, ambulance, and other emergency services
- 📍 **Real-time Location Tracking** - Automatic location detection and address resolution
- 📞 **One-Click Calling** - Instant emergency calls with location logging
- 🔍 **Smart Search & Filter** - Find contacts by name, category, or phone number
- ➕ **Custom Contacts** - Add, edit, and manage personal emergency contacts
- 📱 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🗺️ **Map Integration** - Open locations directly in Google Maps
- 📊 **Emergency Logs** - Track all emergency calls with timestamps and locations

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd contacthub
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend (backend/.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/emergency-contact-hub
NODE_ENV=development
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 6. Start the Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### 7. Start the Frontend Development Server
Open a new terminal:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
contacthub/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection & seeding
│   ├── models/
│   │   ├── EmergencyContact.js  # Contact schema
│   │   └── EmergencyLog.js      # Log schema
│   ├── routes/
│   │   ├── contactRoutes.js     # Contact API routes
│   │   └── logRoutes.js         # Log API routes
│   ├── .env                     # Backend environment variables
│   ├── package.json             # Backend dependencies
│   └── server.js                # Express server entry point
├── src/
│   ├── components/
│   │   ├── AddContactModal.jsx  # Add/Edit contact modal
│   │   ├── EmergencyCard.jsx    # Contact card component
│   │   └── LocationTracker.jsx  # Location display component
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── utils/
│   │   └── geolocation.js       # Location utilities
│   ├── App.jsx                  # Main application component
│   ├── index.css                # Global styles with Tailwind
│   └── main.jsx                 # React entry point
├── .env                         # Frontend environment variables
├── package.json                 # Frontend dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # Project documentation
```

## 🔌 API Endpoints

### Emergency Contacts
- `GET /api/contacts` - Get all contacts (with optional filters)
- `GET /api/contacts/:id` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Emergency Logs
- `GET /api/logs` - Get all logs
- `GET /api/logs/:id` - Get log by ID
- `POST /api/logs` - Create new log
- `PATCH /api/logs/:id/status` - Update log status
- `DELETE /api/logs/:id` - Delete log

### Health Check
- `GET /api/health` - Server health status

## 🎨 Features in Detail

### Location Tagging
- Automatic geolocation detection using browser's Geolocation API
- Reverse geocoding to convert coordinates to readable addresses
- Location accuracy tracking
- Integration with Google Maps for navigation

### Emergency Call Logging
- Automatic logging of all emergency calls
- Captures user location at time of call
- Tracks call status (initiated, in-progress, resolved)
- Timestamp recording for audit trail

### Contact Management
- Predefined emergency contacts (Police, Fire, Ambulance, etc.)
- Custom contact creation with full details
- Category-based organization
- Search functionality across all fields
- Edit and delete capabilities (custom contacts only)

## 🔒 Security Notes

- Location data is only accessed with user permission
- API endpoints should be secured with authentication in production
- Environment variables should never be committed to version control
- MongoDB connection should use authentication in production

## 🚀 Production Deployment

### Frontend Build
```bash
npm run build
```
This creates an optimized production build in the `dist/` folder.

### Backend Production
```bash
cd backend
npm start
```

### Environment Variables for Production
Update the `.env` files with production values:
- Use production MongoDB URI (MongoDB Atlas recommended)
- Set `NODE_ENV=production`
- Update `VITE_API_URL` to your production API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for emergency preparedness

## 🙏 Acknowledgments

- Emergency service numbers are based on Indian emergency services
- Location services powered by OpenStreetMap Nominatim
- Icons by Lucide React
