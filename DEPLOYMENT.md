# 🚀 Deployment Guide - Emergency Contact Hub

## 📋 Pre-Deployment Checklist

- [ ] All dependencies installed
- [ ] Application tested locally
- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] API endpoints verified
- [ ] Frontend builds successfully
- [ ] Security review completed
- [ ] Backup plan in place

---

## 🌐 Deployment Options

### Option 1: Traditional VPS (Recommended for Full Control)
### Option 2: Cloud Platform (Easiest)
### Option 3: Containerized (Docker)

---

## 🔧 Option 1: VPS Deployment (DigitalOcean, AWS EC2, Linode)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### Step 2: Clone and Setup Application

```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> contacthub
cd contacthub

# Install frontend dependencies
npm install
npm run build

# Install backend dependencies
cd backend
npm install
cd ..

# Set up environment variables
sudo nano backend/.env
```

**Production backend/.env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/emergency-contact-hub
NODE_ENV=production
```

### Step 3: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/contacthub
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/contacthub/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/contacthub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Start Backend with PM2

```bash
cd /var/www/contacthub/backend
pm2 start server.js --name contacthub-backend
pm2 save
pm2 startup
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ☁️ Option 2: Cloud Platform Deployment

### A. Frontend - Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Import GitHub repository
- Configure build settings:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Add environment variable:
  - `VITE_API_URL`: Your backend API URL
- Deploy

### B. Backend - Render / Railway

**Render.com:**
1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Add environment variables:
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `NODE_ENV`: production
5. Deploy

**Railway.app:**
1. New Project → Deploy from GitHub
2. Select repository
3. Add MongoDB plugin
4. Configure environment variables
5. Deploy

### C. Database - MongoDB Atlas

1. **Create Cluster**
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Choose region closest to your users

2. **Configure Access**
- Database Access → Add User
- Network Access → Add IP (0.0.0.0/0 for all)

3. **Get Connection String**
- Connect → Connect your application
- Copy connection string
- Replace `<password>` with your password

4. **Update Backend .env**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emergency-contact-hub?retryWrites=true&w=majority
```

---

## 🐳 Option 3: Docker Deployment

### Create Docker Files

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
EXPOSE 5000
CMD ["npm", "start"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: emergency-contact-hub

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongodb:27017/emergency-contact-hub
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

**Deploy with Docker:**
```bash
docker-compose up -d
```

---

## 🔐 Production Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://api.your-domain.com/api
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/emergency-contact-hub
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, etc.)
- Rotate credentials regularly

### 2. CORS Configuration
```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 3. MongoDB Security
- Enable authentication
- Use strong passwords
- Whitelist IP addresses
- Enable encryption at rest

### 4. API Security
- Add rate limiting
- Implement authentication (JWT)
- Validate all inputs
- Use HTTPS only

### 5. Headers Security
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs contacthub-backend
pm2 status
```

### Log Management
```javascript
// Use Winston or Morgan
import morgan from 'morgan';
app.use(morgan('combined'));
```

### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake

---

## 🔄 CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build frontend
      run: npm run build
    
    - name: Deploy to server
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        TARGET: /var/www/contacthub
```

---

## 🧪 Testing Before Deployment

```bash
# Test frontend build
npm run build
npm run preview

# Test backend
cd backend
npm start

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Test API endpoints
curl http://localhost:5000/api/health
```

---

## 📱 Progressive Web App (PWA) Setup

**manifest.json:**
```json
{
  "name": "Emergency Contact Hub",
  "short_name": "EmergencyHub",
  "description": "Quick access to emergency services",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#DC2626",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Issue: Frontend can't connect to backend
**Solution:**
- Check CORS configuration
- Verify API URL in frontend .env
- Check backend is running
- Verify firewall rules

### Issue: MongoDB connection failed
**Solution:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string
- Check network access in MongoDB Atlas
- Test connection: `mongo <connection-string>`

### Issue: Location not working
**Solution:**
- Ensure HTTPS is enabled (required for geolocation)
- Check browser permissions
- Verify API key if using paid geocoding service

### Issue: Build fails
**Solution:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`
- Review build logs
- Check for missing dependencies

---

## 📈 Performance Optimization

### Frontend
- Enable Gzip compression in Nginx
- Use CDN for static assets
- Implement code splitting
- Optimize images
- Enable browser caching

### Backend
- Add Redis caching
- Database indexing
- Connection pooling
- Load balancing
- API response compression

### Database
```javascript
// Add indexes
EmergencyContact.index({ name: 'text', phone: 'text' });
EmergencyContact.index({ category: 1 });
EmergencyContact.index({ isPredefined: 1 });
```

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible via domain
- [ ] SSL certificate active
- [ ] API endpoints working
- [ ] Database connected
- [ ] Location services working
- [ ] Mobile responsive
- [ ] Error logging active
- [ ] Backup system configured
- [ ] Monitoring setup
- [ ] Documentation updated

---

## 📞 Support & Maintenance

### Regular Tasks
- Weekly: Check logs and errors
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: SSL certificate renewal (auto with Let's Encrypt)

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/emergency-contact-hub" --out=/backups/$(date +%Y%m%d)

# Automate with cron
0 2 * * * mongodump --uri="mongodb://localhost:27017/emergency-contact-hub" --out=/backups/$(date +\%Y\%m\%d)
```

---

## 🌟 Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- Session management (Redis)
- Database replication

### Vertical Scaling
- Increase server resources
- Optimize queries
- Add caching layers
- CDN for static assets

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
