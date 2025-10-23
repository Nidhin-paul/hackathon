# 🚀 Quick Start Guide

Get the Emergency Contact Hub up and running in minutes!

## Prerequisites Check

✅ Node.js installed? Run: `node --version` (need v16+)  
✅ MongoDB installed? Run: `mongod --version` (need v4.4+)  
✅ npm installed? Run: `npm --version`

## Step-by-Step Setup

### 1️⃣ Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 2️⃣ Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3️⃣ Start Backend Server

Open a terminal:
```bash
cd backend
npm run dev
```

✅ You should see:
```
Server is running on port 5000
MongoDB Connected: localhost
Predefined emergency contacts seeded successfully
```

### 4️⃣ Start Frontend

Open a **new** terminal:
```bash
npm run dev
```

✅ You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5️⃣ Open in Browser

Navigate to: **http://localhost:5173**

## 🎉 You're Ready!

The app should now display:
- 📍 Location tracker at the top
- 🔍 Search bar and category filters
- 📞 Predefined emergency contacts (Police, Fire, Ambulance, etc.)

## 🧪 Test the Features

1. **Allow Location Access** - Click "Allow" when prompted for location
2. **Search Contacts** - Try searching for "police" or "ambulance"
3. **Filter by Category** - Click on category buttons (Police, Fire, etc.)
4. **Add Custom Contact** - Click "Add Contact" button
5. **View Location** - Check the location tracker shows your address

## ⚠️ Troubleshooting

### Backend won't start?
- Make sure MongoDB is running
- Check if port 5000 is available
- Verify `.env` file exists in `backend/` folder

### Frontend won't start?
- Make sure you ran `npm install` in the root directory
- Check if port 5173 is available
- Verify `.env` file exists in root folder

### Can't connect to API?
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify `VITE_API_URL` in `.env` is set to `http://localhost:5000/api`

### Location not working?
- Allow location permissions in your browser
- Use HTTPS in production (required for geolocation)
- Check browser console for geolocation errors

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints at `http://localhost:5000/api/health`
- Customize emergency contacts for your region
- Deploy to production (see README for deployment guide)

## 💡 Tips

- The app seeds 6 predefined emergency contacts on first run
- Custom contacts can be edited and deleted
- Predefined contacts are protected from modification
- All emergency calls are logged with location data
- Location data is only accessed with user permission

## 🆘 Need Help?

Check the main [README.md](README.md) for:
- Detailed API documentation
- Project structure explanation
- Production deployment guide
- Security best practices
