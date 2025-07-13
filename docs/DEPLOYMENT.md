# Deployment Guide

This guide covers deploying the Amplimentor platform to production environments.

## Prerequisites

- Node.js 16+ and npm
- MongoDB database (local or cloud)
- Stripe account for payments
- Domain name (optional)
- SSL certificate (recommended)

## Backend Deployment

### 1. Environment Setup

Create a `.env` file in the backend directory with production values:

```env
# Production Environment
NODE_ENV=production
PORT=3000

# MongoDB (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amplimentor

# Stripe (Use live keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Session (Use a strong secret)
SESSION_SECRET=your_very_strong_session_secret_here

# CORS (Your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Set up database access (username/password)
4. Set up network access (IP whitelist)
5. Get connection string

#### Option B: Self-hosted MongoDB
1. Install MongoDB on your server
2. Configure authentication
3. Set up firewall rules

### 3. Server Deployment

#### Option A: VPS/Cloud Server (DigitalOcean, AWS, etc.)

1. **Connect to your server:**
```bash
ssh user@your-server-ip
```

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone your repository:**
```bash
git clone https://github.com/yourusername/amplimentor.git
cd amplimentor/backend
```

4. **Install dependencies:**
```bash
npm install --production
```

5. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your production values
nano .env
```

6. **Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

7. **Start the application:**
```bash
pm2 start server.js --name "amplimentor-backend"
pm2 save
pm2 startup
```

#### Option B: Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku app:**
```bash
heroku create your-app-name
```

4. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set STRIPE_SECRET_KEY=your_stripe_key
# ... set other variables
```

5. **Deploy:**
```bash
git push heroku main
```

### 4. Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/amplimentor`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/amplimentor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate (Recommended)

Install Certbot for Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Frontend Deployment

### 1. Static Hosting (Netlify, Vercel, etc.)

#### Option A: Netlify

1. **Connect your GitHub repository to Netlify**
2. **Set build settings:**
   - Build command: `echo "No build required"`
   - Publish directory: `frontend`
3. **Set environment variables:**
   - `REACT_APP_API_URL`: Your backend URL

#### Option B: Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel
```

### 2. Traditional Web Server

1. **Build the frontend:**
```bash
cd frontend
npm install
npm run build
```

2. **Upload to web server:**
```bash
scp -r dist/* user@your-server:/var/www/html/
```

3. **Configure web server (Apache/Nginx) to serve static files**

## Stripe Webhook Setup

1. **In Stripe Dashboard:**
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

2. **Copy webhook signing secret to your environment variables**

## Monitoring and Maintenance

### 1. Logs
```bash
# View PM2 logs
pm2 logs amplimentor-backend

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Database Backups
```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://username:password@host:port/database" /backup/20240115/
```

### 3. File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

### 4. Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart amplimentor-backend
```

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong session secrets
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] File upload validation
- [ ] Rate limiting
- [ ] Input validation and sanitization

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Use CDN for static assets
- [ ] Optimize images
- [ ] Database indexing
- [ ] Caching strategies
- [ ] Load balancing (if needed)

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

2. **Permission denied:**
```bash
sudo chown -R $USER:$USER /path/to/app
```

3. **MongoDB connection failed:**
   - Check connection string
   - Verify network access
   - Check authentication

4. **Stripe webhook failures:**
   - Verify webhook URL
   - Check webhook secret
   - Test with Stripe CLI

### Support

For deployment issues:
1. Check logs: `pm2 logs`
2. Verify environment variables
3. Test database connection
4. Check network connectivity 