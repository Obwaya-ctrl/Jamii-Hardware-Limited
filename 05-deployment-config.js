/**
 * JAMII HARDWARE - DEPLOYMENT & CONFIGURATION
 * Docker setup, environment variables, and deployment guide
 */

// ============ .env.example ============
# FRONTEND
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY
FRONTEND_URL=http://localhost:3000

# BACKEND
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://jamii:password@localhost:5432/jamii_hardware
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# M-PESA INTEGRATION
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd
BACKEND_URL=https://yourdomain.com

# EMAIL SERVICE (SendGrid or Gmail)
SENDGRID_API_KEY=your_sendgrid_api_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=jamii-hardware

# STRIPE (optional payment gateway)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# CLOUDINARY (image hosting)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ANALYTICS
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
FACEBOOK_PIXEL_ID=your_pixel_id

# ADMIN SETTINGS
ADMIN_EMAIL=admin@jamiihardware.com
SUPPORT_EMAIL=support@jamiihardware.com
PHONE_NUMBER=+254712345678

// ============ Dockerfile (Backend) ============
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]

// ============ docker-compose.yml ============
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: jamii_postgres
    environment:
      POSTGRES_USER: jamii
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: jamii_hardware
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./04-database-schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - jamii_network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: jamii_redis
    ports:
      - "6379:6379"
    networks:
      - jamii_network
    restart: unless-stopped

  # Backend API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jamii_api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://jamii:secure_password_here@postgres:5432/jamii_hardware
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MPESA_CONSUMER_KEY: ${MPESA_CONSUMER_KEY}
      MPESA_CONSUMER_SECRET: ${MPESA_CONSUMER_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis
    networks:
      - jamii_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (Next.js)
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: jamii_web
    environment:
      NEXT_PUBLIC_API_URL: http://api:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - api
    networks:
      - jamii_network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: jamii_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - web
    networks:
      - jamii_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  jamii_network:
    driver: bridge

// ============ nginx.conf ============
events {
  worker_connections 1024;
}

http {
  upstream api {
    server api:5000;
  }

  upstream web {
    server web:3000;
  }

  # Redirect HTTP to HTTPS
  server {
    listen 80;
    server_name jamiihardware.com www.jamiihardware.com;
    return 301 https://$server_name$request_uri;
  }

  # HTTPS Server
  server {
    listen 443 ssl http2;
    server_name jamiihardware.com www.jamiihardware.com;

    # SSL Certificates (use Let's Encrypt)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;

    # API Proxy
    location /api/ {
      proxy_pass http://api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 30s;
    }

    # Frontend
    location / {
      proxy_pass http://web;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}

// ============ package.json (Backend) ============
{
  "name": "jamii-hardware-api",
  "version": "1.0.0",
  "description": "Jamii Hardware eCommerce API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "build": "npm install --production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.0.3",
    "pg": "^8.10.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "axios": "^1.4.0",
    "multer": "^1.4.5-lts.1",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.0",
    "nodemailer": "^6.9.3",
    "redis": "^4.6.7",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}

// ============ package.json (Frontend - Next.js) ============
{
  "name": "jamii-hardware-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "export": "next export"
  },
  "dependencies": {
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "zustand": "^4.3.8",
    "next-router-prefetch": "^0.0.1",
    "react-icons": "^4.9.0",
    "framer-motion": "^10.12.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "eslint": "^8.43.0",
    "eslint-config-next": "^13.4.0"
  }
}

// ============ DEPLOYMENT GUIDE ============

/*

JAMII HARDWARE - PRODUCTION DEPLOYMENT GUIDE
=============================================

## 1. SERVER SETUP

### Prerequisites
- Linux server (Ubuntu 22.04 recommended)
- Domain name configured
- SSL certificate (Let's Encrypt)
- Cloud provider account (AWS, DigitalOcean, Heroku, or similar)

### Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (if not using Docker)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

## 2. DEPLOY WITH DOCKER

```bash
# Clone repository
git clone https://github.com/yourusername/jamii-hardware.git
cd jamii-hardware

# Create .env file from example
cp .env.example .env
# Edit .env with production values

# Set up SSL
sudo certbot certonly --standalone -d jamiihardware.com -d www.jamiihardware.com
sudo cp /etc/letsencrypt/live/jamiihardware.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/jamiihardware.com/privkey.pem ./ssl/key.pem

# Build and start containers
docker-compose up -d

# Run database migrations
docker-compose exec api npm run migrate

# Seed sample data
docker-compose exec api npm run seed

# Check logs
docker-compose logs -f api
```

## 3. DEPLOY TO HEROKU

```bash
# Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create jamii-hardware-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 -a jamii-hardware-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key -a jamii-hardware-api
heroku config:set MPESA_CONSUMER_KEY=your_key -a jamii-hardware-api
# ... set other variables

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate -a jamii-hardware-api
```

## 4. DEPLOY TO AWS (EC2 + RDS)

```bash
# Launch EC2 instance (Ubuntu 22.04)
# Connect via SSH

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Clone and configure
git clone your_repo
cd jamii-hardware
cp .env.example .env

# Update DATABASE_URL to point to RDS endpoint
# Update JWT_SECRET and other sensitive vars

# Build and run
docker-compose up -d

# Set up CloudFront for CDN
# Set up Route 53 for DNS
# Set up AWS Secrets Manager for sensitive data
```

## 5. CI/CD PIPELINE

### GitHub Actions (.github/workflows/deploy.yml)

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Tests
        run: npm test
      
      - name: Build Docker Image
        run: docker build -t jamii-hardware:${{ github.sha }} .
      
      - name: Push to Docker Hub
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker push jamii-hardware:${{ github.sha }}
      
      - name: Deploy to Production
        run: |
          ssh -i ${{ secrets.SSH_KEY }} user@${{ secrets.SERVER_IP }}
          cd /app/jamii-hardware
          docker pull jamii-hardware:${{ github.sha }}
          docker-compose up -d

## 6. MONITORING & LOGGING

### Set up monitoring
- CloudWatch (AWS) or Datadog
- Error tracking with Sentry
- Performance monitoring with New Relic

### Logs
```bash
# View API logs
docker logs -f jamii_api

# View Database logs
docker logs -f jamii_postgres

# View Nginx logs
docker logs -f jamii_nginx
```

## 7. BACKUP STRATEGY

```bash
# Daily database backups to S3
docker-compose exec postgres pg_dump -U jamii jamii_hardware | \
  gzip | \
  aws s3 cp - s3://jamii-backups/db-$(date +%Y-%m-%d).sql.gz

# Automated backup script (cron)
0 2 * * * /app/scripts/backup.sh >> /var/log/jamii-backup.log 2>&1
```

## 8. SECURITY CHECKLIST

- [ ] Update all environment variables
- [ ] Enable HTTPS with valid certificate
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set database password securely
- [ ] Enable database backups
- [ ] Configure WAF (Web Application Firewall)
- [ ] Set up DDoS protection
- [ ] Enable security headers in Nginx
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

## 9. PERFORMANCE OPTIMIZATION

- Enable Redis caching
- Set up CDN for static files
- Enable Gzip compression
- Optimize images
- Database query optimization
- Load balancing
- Auto-scaling configuration

## 10. HEALTH CHECK

```bash
curl https://jamiihardware.com/api/health
# Should return: {"status": "OK", "timestamp": "..."}
```

*/

// ============ GitHub Actions CI/CD ============
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: jamii
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: jamii_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://jamii:testpass@localhost:5432/jamii_test
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t jamii-hardware:${{ github.sha }} .
      
      - name: Login to DockerHub
        run: docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
      
      - name: Push image to DockerHub
        run: |
          docker tag jamii-hardware:${{ github.sha }} jamii-hardware:latest
          docker push jamii-hardware:${{ github.sha }}
          docker push jamii-hardware:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Production
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.DEPLOY_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SERVER_IP }} >> ~/.ssh/known_hosts
          ssh -i ~/.ssh/deploy_key ${{ secrets.DEPLOY_USER }}@${{ secrets.SERVER_IP }} 'cd /app && docker-compose pull && docker-compose up -d'
