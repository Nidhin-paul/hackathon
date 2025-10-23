# 👤 User Registration & Authentication Feature

Complete user registration system with database storage, password hashing, and JWT authentication.

## 📋 Overview

Users can now register accounts that are stored in MongoDB with:
- Secure password hashing (bcrypt)
- JWT token authentication
- Email validation
- User profile management
- Auto-login after registration

---

## 🗄️ Database Schema

### **User Model** (`backend/models/User.js`)

```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  lastLogin: Date
}
```

**Features:**
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Email validation with regex
- ✅ Unique email constraint
- ✅ Password comparison method
- ✅ JSON serialization (excludes password)
- ✅ Timestamps for tracking

---

## 🔐 Authentication System

### **Backend Routes** (`backend/routes/authRoutes.js`)

#### **1. Register User**
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-10-22T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- ✅ All fields required
- ✅ Email format validation
- ✅ Duplicate email check
- ✅ Password min 6 characters
- ✅ Automatic password hashing

#### **2. Login User**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

**Features:**
- ✅ Email & password validation
- ✅ Password comparison
- ✅ Account status check
- ✅ Last login timestamp update
- ✅ JWT token generation

#### **3. Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### **4. Get All Users** (Admin)
```
GET /api/auth/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "John Doe", "email": "john@example.com", ... },
    { "name": "Jane Smith", "email": "jane@example.com", ... }
  ]
}
```

---

## 🎨 Frontend Implementation

### **RegisterPage.jsx**

**Features:**
- ✅ Form validation
- ✅ Password confirmation
- ✅ Show/hide password toggle
- ✅ Loading state
- ✅ Error messages
- ✅ Success messages
- ✅ Auto-redirect after registration
- ✅ Token storage in localStorage

**Validation Rules:**
1. All fields required
2. Valid email format
3. Password min 6 characters
4. Passwords must match
5. No duplicate emails

**User Flow:**
```
1. User fills registration form
2. Click "Create Account"
3. Frontend validates input
4. API call to /api/auth/register
5. Backend creates user & returns token
6. Token stored in localStorage
7. Success message shown
8. Auto-redirect to dashboard (1.5s)
```

---

## 🔒 Security Features

### **Password Hashing**
```javascript
// bcryptjs with 10 salt rounds
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

**Benefits:**
- ✅ One-way encryption
- ✅ Salt prevents rainbow table attacks
- ✅ Slow hashing (prevents brute force)
- ✅ Industry standard

### **JWT Tokens**
```javascript
jwt.sign(
  { userId, email, role },
  JWT_SECRET,
  { expiresIn: '7d' }
)
```

**Features:**
- ✅ Stateless authentication
- ✅ 7-day expiration
- ✅ User info in payload
- ✅ Signature verification

### **Data Validation**
- ✅ Email format regex
- ✅ Password length check
- ✅ Required field validation
- ✅ Unique email constraint
- ✅ XSS protection (sanitization)

---

## 📦 Dependencies Added

### **Backend** (`package.json`)
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

**Installation:**
```bash
cd backend
npm install
```

---

## 🎯 API Service

### **Frontend** (`src/services/api.js`)

```javascript
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: (token) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllUsers: () => api.get('/auth/users'),
};
```

**Usage:**
```javascript
// Register
const response = await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Login
const response = await authAPI.login({
  email: 'john@example.com',
  password: 'password123'
});

// Get current user
const token = localStorage.getItem('token');
const response = await authAPI.getCurrentUser(token);
```

---

## 💾 Data Storage

### **LocalStorage**
```javascript
// Store after registration/login
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Clear on logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

### **MongoDB**
```javascript
// User document example
{
  "_id": "6537f8a9b1c2d3e4f5a6b7c8",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", // hashed
  "role": "user",
  "isActive": true,
  "createdAt": "2025-10-22T11:20:00.000Z",
  "lastLogin": "2025-10-22T11:25:00.000Z"
}
```

---

## 🎨 UI Components

### **Success Message**
```jsx
{success && (
  <div className="success-message">
    <CheckCircle className="w-5 h-5" />
    <span>{success}</span>
  </div>
)}
```

**Styling:**
```css
.success-message {
  background-color: #d1fae5;
  border: 1px solid #10b981;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.5rem;
  animation: fadeInDown 0.3s ease-out;
}
```

### **Loading Button**
```jsx
<button 
  type="submit" 
  disabled={loading}
>
  {loading ? 'Creating Account...' : 'Create Account'}
</button>
```

**Styling:**
```css
.register-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
```

---

## 🧪 Testing

### **Test Registration Flow**

1. **Navigate to Register Page**
   ```
   http://localhost:5175/register
   ```

2. **Fill Form**
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm Password: password123

3. **Submit Form**
   - Click "Create Account"
   - See loading state
   - See success message
   - Auto-redirect to dashboard

4. **Verify Database**
   ```bash
   # MongoDB Shell
   use contacthub
   db.users.find().pretty()
   ```

5. **Check LocalStorage**
   - Open DevTools → Application → LocalStorage
   - Verify `token` exists
   - Verify `user` object exists

### **Test Validation**

**Empty Fields:**
```
Error: "Please fill in all fields"
```

**Invalid Email:**
```
Email: "notanemail"
Error: "Please enter a valid email"
```

**Short Password:**
```
Password: "12345"
Error: "Password must be at least 6 characters"
```

**Password Mismatch:**
```
Password: "password123"
Confirm: "password456"
Error: "Passwords do not match"
```

**Duplicate Email:**
```
Email: "existing@example.com"
Error: "User with this email already exists"
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│  Register Page  │
│   (Frontend)    │
└────────┬────────┘
         │ POST /api/auth/register
         │ { name, email, password }
         ▼
┌─────────────────┐
│  Auth Routes    │
│   (Backend)     │
└────────┬────────┘
         │ Validate & Hash Password
         ▼
┌─────────────────┐
│   User Model    │
│   (MongoDB)     │
└────────┬────────┘
         │ Save User Document
         ▼
┌─────────────────┐
│  Generate JWT   │
│     Token       │
└────────┬────────┘
         │ Return { user, token }
         ▼
┌─────────────────┐
│  Store in       │
│  LocalStorage   │
└────────┬────────┘
         │ Redirect to Dashboard
         ▼
┌─────────────────┐
│   Dashboard     │
│  (Logged In)    │
└─────────────────┘
```

---

## 🚀 Future Enhancements

### **Potential Features**
- [ ] Email verification
- [ ] Password reset via email
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Password strength meter
- [ ] Account settings page
- [ ] Profile picture upload
- [ ] Session management
- [ ] Remember me option
- [ ] Login history tracking
- [ ] Account deletion
- [ ] Role-based access control
- [ ] OAuth2 integration
- [ ] Refresh tokens
- [ ] Rate limiting

---

## 🐛 Troubleshooting

### **Registration Fails**

**Check:**
1. Backend server running on port 5000
2. MongoDB connected
3. Network tab shows 200 response
4. Console for errors

**Common Issues:**
```javascript
// CORS error
// Fix: Check backend CORS config

// Duplicate email
// Fix: Use different email or clear DB

// Validation error
// Fix: Check all fields filled correctly
```

### **Token Not Stored**

**Check:**
```javascript
// Verify response structure
console.log(response.data);

// Check localStorage
console.log(localStorage.getItem('token'));

// Verify token format
const token = localStorage.getItem('token');
console.log(token.split('.').length); // Should be 3
```

### **Password Not Hashing**

**Check:**
```javascript
// Verify bcryptjs installed
npm list bcryptjs

// Check User model pre-save hook
// Should hash before saving
```

---

## 📊 Database Queries

### **Find User by Email**
```javascript
const user = await User.findOne({ 
  email: 'john@example.com' 
});
```

### **Get All Users**
```javascript
const users = await User.find()
  .select('-password')
  .sort({ createdAt: -1 });
```

### **Update User**
```javascript
await User.findByIdAndUpdate(userId, {
  name: 'New Name',
  lastLogin: new Date()
});
```

### **Delete User**
```javascript
await User.findByIdAndDelete(userId);
```

### **Count Users**
```javascript
const count = await User.countDocuments();
```

---

## 🎉 Summary

**Registration System Features:**
- ✅ User registration with database storage
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Email validation & uniqueness
- ✅ Form validation & error handling
- ✅ Success messages & loading states
- ✅ Auto-login after registration
- ✅ LocalStorage token management
- ✅ RESTful API endpoints
- ✅ MongoDB integration

**Files Created/Modified:**
- `backend/models/User.js` - User schema
- `backend/routes/authRoutes.js` - Auth endpoints
- `backend/server.js` - Added auth routes
- `backend/package.json` - Added dependencies
- `src/services/api.js` - Added authAPI
- `src/pages/RegisterPage.jsx` - API integration
- `src/pages/RegisterPage.css` - Success message styles

**Result:** Users can now register accounts that are securely stored in MongoDB with hashed passwords and JWT authentication! 🎉✨
