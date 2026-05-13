/**
 * JAMII HARDWARE - COMPLETE SETUP & ARCHITECTURE GUIDE
 * Quick start, system architecture, and deployment instructions
 */

// ============ PROJECT STRUCTURE ============

/**

jamii-hardware/
├── backend/                          # Node.js/Express API
│   ├── server.js                     # Main server file (01-backend-server.js)
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Environment template
│   ├── routes/
│   │   ├── auth.js                   # Authentication routes
│   │   ├── products.js               # Product routes
│   │   ├── orders.js                 # Order routes
│   │   ├── payments.js               # Payment routes
│   │   └── admin.js                  # Admin routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── validation.js             # Input validation
│   │   └── errorHandler.js           # Error handling
│   ├── utils/
│   │   ├── database.js               # DB connection pool
│   │   ├── email.js                  # Email service
│   │   └── sms.js                    # SMS service
│   ├── migrations/                   # Database migrations
│   └── tests/
│       ├── auth.test.js
│       ├── products.test.js
│       └── orders.test.js
│
├── frontend/                         # Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   ├── pages/
│   │   ├── index.js                  # Homepage
│   │   ├── shop.js                   # Product listing
│   │   ├── product/
│   │   │   └── [id].js               # Product details
│   │   ├── cart.js                   # Shopping cart
│   │   ├── checkout.js               # Checkout
│   │   ├── account.js                # User account
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   └── customers.js
│   │   ├── api/
│   │   │   ├── config.js
│   │   │   └── health.js
│   │   ├── about.js
│   │   ├── contact.js
│   │   ├── blog.js
│   │   ├── faq.js
│   │   ├── privacy.js
│   │   └── terms.js
│   ├── components/
│   │   ├── Navigation.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   ├── Cart.js
│   │   ├── AdminLayout.js
│   │   └── ... (more components)
│   ├── lib/
│   │   ├── api.js                    # API helper
│   │   ├── auth.js                   # Auth utilities
│   │   └── hooks.js                  # Custom hooks
│   ├── public/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── images/
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.config.js
│   └── tests/
│
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── database/
│   └── schema.sql                    # (04-database-schema.sql)
├── docs/
│   ├── API.md                        # (07-api-integrations.js)
│   ├── DEPLOYMENT.md                 # (05-deployment-config.js)
│   ├── SEO.md                        # (06-seo-security-testing.js)
│   └── SECURITY.md                   # (06-seo-security-testing.js)
├── .github/
│   └── workflows/
│       └── deploy.yml                # CI/CD pipeline
├── README.md
└── .gitignore

*/

// ============ QUICK START GUIDE ============

/**

## JAMII HARDWARE - QUICK START (15 MINUTES)

### OPTION 1: LOCAL DEVELOPMENT (Without Docker)

#### Step 1: Prerequisites
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 15+ (https://www.postgresql.org/)
- npm or yarn

#### Step 2: Setup Backend

```bash
# Clone repository
git clone https://github.com/yourusername/jamii-hardware.git
cd jamii-hardware

# Install backend dependencies
npm install

# Create database
createdb jamii_hardware

# Copy environment file
cp .env.example .env

# Edit .env with your values
# Database password, JWT secret, payment credentials, etc.

# Run database schema
psql jamii_hardware < database/schema.sql

# Start API server
npm run dev
# Server running at http://localhost:5000
```

#### Step 3: Setup Frontend

```bash
# In new terminal
cd frontend
npm install

# Create .env.local
cp .env.example .env.local

# Edit NEXT_PUBLIC_API_URL to http://localhost:5000/api

# Start development server
npm run dev
# Open http://localhost:3000
```

#### Step 4: Test

```bash
# Homepage should load ✓
# Click "Shop" to browse products ✓
# Try adding to cart ✓
# Admin dashboard: http://localhost:3000/admin/dashboard ✓
```

---

### OPTION 2: DOCKER DEPLOYMENT (Recommended for Production)

#### Step 1: Prerequisites
- Docker (https://www.docker.com/products/docker-desktop)
- Docker Compose

#### Step 2: Deploy

```bash
# Clone repository
git clone https://github.com/yourusername/jamii-hardware.git
cd jamii-hardware

# Create environment file
cp .env.example .env

# Edit .env with production values (database password, API keys, etc.)

# Start all services
docker-compose up -d

# Wait for services to start (20-30 seconds)
docker-compose logs -f

# Check services are running
docker-compose ps

# Should see:
# - postgres (healthy)
# - redis (running)
# - api (running)
# - web (running)
# - nginx (running)
```

#### Step 3: Access Application

```bash
# Frontend: http://localhost or https://yourdomain.com
# API: http://localhost/api/health
# Admin: http://localhost/admin/dashboard
```

#### Step 4: Initial Setup

```bash
# Seed sample products (optional)
docker-compose exec api npm run seed

# View database
docker-compose exec postgres psql -U jamii -d jamii_hardware
# List tables: \dt
# Exit: \q
```

---

### OPTION 3: CLOUD DEPLOYMENT (Heroku/Railway/Vercel)

#### Deploy Backend to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create apps
heroku create jamii-api --region eu
heroku create jamii-web --region eu

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev -a jamii-api

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key -a jamii-api
heroku config:set MPESA_CONSUMER_KEY=your_key -a jamii-api
# (set all other variables)

# Deploy backend
git push heroku main:main

# Run migrations
heroku run npm run migrate -a jamii-api
```

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
# NEXT_PUBLIC_API_URL=https://jamii-api.herokuapp.com/api

# Deploy again
vercel --prod
```

*/

// ============ SYSTEM ARCHITECTURE ============

/**

## JAMII HARDWARE ARCHITECTURE

### HIGH-LEVEL ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│                    USER (Customer/Admin)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──── WEB BROWSER / MOBILE APP
                     │
┌────────────────────┴────────────────────────────────────────┐
│                      NGINX REVERSE PROXY                     │
│              (Routing, SSL, Caching, Rate Limiting)          │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼─────┐            ┌───▼────┐
    │ Next.js  │            │Express │
    │Frontend  │            │ API    │
    │(React)   │            │        │
    └────┬─────┘            └───┬────┘
         │                      │
         │         ┌────────────┴──────────────┐
         │         │                           │
    ┌────▼────────────────┐          ┌────────▼───────┐
    │   PostgreSQL DB     │          │  Redis Cache   │
    │  (Data Storage)     │          │  (Sessions)    │
    └─────────────────────┘          └────────────────┘
         │
         ├─────────────────────────┐
         │                         │
    ┌────▼───────┐           ┌────▼──────┐
    │  M-Pesa    │           │ Cloudinary│
    │  Daraja    │           │(Images)   │
    │  API       │           │           │
    └────────────┘           └───────────┘
         │
    ┌────▼────────────────────────────┐
    │  SendGrid Email / Africa's SMS   │
    │  (Notifications)                 │
    └─────────────────────────────────┘

### TECHNOLOGY STACK

Frontend Layer:
- Framework: Next.js 13
- UI Library: React 18
- Styling: Tailwind CSS 3
- State Management: Zustand / Context API
- HTTP Client: Axios
- Icons: React Icons
- Animations: Framer Motion
- Forms: React Hook Form

Backend Layer:
- Runtime: Node.js 18
- Framework: Express.js 4
- Database: PostgreSQL 15
- Cache: Redis 7
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcryptjs
- Validation: express-validator
- File Upload: Multer
- Security: Helmet.js, CORS

Infrastructure:
- Containerization: Docker
- Orchestration: Docker Compose
- Reverse Proxy: Nginx
- SSL/TLS: Let's Encrypt
- CDN: Cloudinary
- DNS: Route 53 (AWS) or similar

Payment & Services:
- Payments: M-Pesa Daraja API
- Email: SendGrid
- SMS: Africa's Talking
- Maps: Google Maps API
- Images: Cloudinary

### DEPLOYMENT ARCHITECTURE (Production)

┌──────────────────────────────────────────────────────────────┐
│                      Internet (Users)                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │   CloudFlare / WAF       │
         │ (DDoS Protection)        │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────┐
         │   SSL Certificate        │
         │  (Let's Encrypt)         │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────┐
         │   Load Balancer          │
         │  (For scaling)           │
         └───────────┬──────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   ┌──▼──┐        ┌──▼──┐       ┌──▼──┐
   │EC2-1│        │EC2-2│       │EC2-3│
   │     │        │     │       │     │
   │ API │        │ API │       │ API │
   └──┬──┘        └──┬──┘       └──┬──┘
      │              │              │
      └──────────────┼──────────────┘
                     │
         ┌───────────▼──────────────┐
         │   RDS PostgreSQL         │
         │  (Multi-AZ)              │
         └──────────────────────────┘

### DATA FLOW

1. User Action (Browse → Add to Cart → Checkout)
   └─> Frontend (React) triggers API call

2. API Request
   └─> Nginx routes to Express.js API
   └─> Authentication middleware validates JWT
   └─> Request processing middleware

3. Business Logic
   └─> Controller validates input
   └─> Database queries execute
   └─> Cache (Redis) updated if needed

4. Response
   └─> Controller returns JSON
   └─> Frontend updates UI

5. Payment Flow (M-Pesa)
   └─> Frontend → STK Push request
   └─> API initiates M-Pesa transaction
   └─> M-Pesa callback updates order status
   └─> Email/SMS notification sent

### SECURITY LAYERS

1. Network Level
   - HTTPS/TLS encryption
   - DDoS protection (CloudFlare)
   - Web Application Firewall (WAF)

2. Application Level
   - JWT authentication
   - Role-based access control (RBAC)
   - Input validation
   - Rate limiting

3. Database Level
   - Password hashing (bcryptjs)
   - Parameterized queries
   - Encrypted connections
   - Regular backups

4. Infrastructure Level
   - Server hardening
   - Firewall rules
   - SSH key authentication
   - Audit logging

*/

// ============ TROUBLESHOOTING GUIDE ============

/**

## COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot connect to database"

Symptoms:
- "ECONNREFUSED 127.0.0.1:5432"
- "Database connection failed"

Solutions:
1. Check PostgreSQL is running: `brew services list` (Mac) or `systemctl status postgresql` (Linux)
2. Verify connection string in .env: `postgresql://user:password@localhost:5432/dbname`
3. Check credentials: `psql -U postgres -c "\\l"`
4. Start service: `brew services start postgresql` or `sudo systemctl start postgresql`

---

### Issue 2: "JWT token is invalid or expired"

Symptoms:
- 403 Unauthorized on protected routes
- "Invalid or expired token"

Solutions:
1. Clear browser cookies and local storage
2. Login again to get new token
3. Check JWT_SECRET matches in .env
4. Verify token expiration time (should be 7 days)

---

### Issue 3: "Port 5000 already in use"

Symptoms:
- "Error: listen EADDRINUSE :::5000"
- Cannot start API server

Solutions:
Linux/Mac:
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

Windows:
```bash
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

Or use different port:
```bash
PORT=5001 npm run dev
```

---

### Issue 4: "M-Pesa STK push not showing"

Symptoms:
- Payment initiated but no popup on phone
- Error: "Checkout not initiated"

Solutions:
1. Verify phone number format: +254712345678 (not 0712345678)
2. Check credentials in .env are correct
3. For sandbox, only registered phone numbers work
4. Check network: `curl -X GET https://sandbox.safaricom.co.ke`
5. Review M-Pesa logs in Daraja dashboard

---

### Issue 5: "Frontend cannot reach API"

Symptoms:
- 404 errors on product fetch
- "Cannot read properties of undefined"

Solutions:
1. Check NEXT_PUBLIC_API_URL in frontend .env
2. Verify API is running: `curl http://localhost:5000/api/health`
3. Check Nginx routing (if using Docker)
4. Allow CORS: Verify CORS origin in backend

---

### Issue 6: "Docker container keeps restarting"

Symptoms:
- `docker-compose ps` shows "Restarting"
- Cannot access services

Solutions:
```bash
# Check logs
docker-compose logs api
docker-compose logs postgres

# Restart services
docker-compose restart

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

---

### Issue 7: "Images not loading from Cloudinary"

Symptoms:
- 404 errors for product images
- Placeholder shown instead

Solutions:
1. Check Cloudinary credentials are set
2. Verify file uploaded to correct folder
3. Check URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[path]
4. Test upload: `curl -F "file=@image.jpg" https://api.cloudinary.com/...`

---

### Issue 8: "Email not being sent"

Symptoms:
- Order confirmation emails missing
- No errors in logs

Solutions:
1. Check SendGrid API key in .env
2. Verify sender email is verified: sendgrid.com > Settings > Sender Authentication
3. Check email doesn't go to spam
4. Review SendGrid activity log for failures
5. Test with `npm run test:email`

*/

// ============ MAINTENANCE CHECKLIST ============

/**

## MAINTENANCE & OPERATIONS CHECKLIST

### Daily (Automated)
- [x] Database backups (automated via cron)
- [x] Monitor server logs (via CloudWatch/DataDog)
- [x] Check error rates (< 1%)
- [x] Verify payment transactions

### Weekly
- [ ] Review analytics dashboard
- [ ] Check low stock alerts
- [ ] Update inventory (manual review)
- [ ] Respond to customer support emails
- [ ] Review failed orders

### Monthly
- [ ] Security audit (OWASP Top 10)
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Update dependencies (`npm audit`, `npm update`)
- [ ] Review access logs for suspicious activity
- [ ] Backup audit: verify restorability
- [ ] Team meeting: KPIs and issues

### Quarterly
- [ ] SSL certificate renewal (auto with Let's Encrypt)
- [ ] Performance testing (load test)
- [ ] Security testing (penetration test)
- [ ] Disaster recovery drill
- [ ] Update documentation

### Annually
- [ ] Complete security audit (third-party)
- [ ] Infrastructure review
- [ ] Technology stack evaluation
- [ ] Business requirements review
- [ ] Team training and updates

### MONITORING CHECKLIST
- [ ] Uptime monitoring (99.9% target)
- [ ] Response time monitoring (< 200ms API)
- [ ] Error rate monitoring (< 1%)
- [ ] Database health checks
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring
- [ ] Network bandwidth monitoring

### BACKUP CHECKLIST
- [ ] Database backups (daily, 30-day retention)
- [ ] Application code (git repository)
- [ ] Uploaded files (S3, 90-day retention)
- [ ] Configuration files (encrypted)
- [ ] Test restoration monthly

*/

// ============ SCALING & OPTIMIZATION ============

/**

## SCALING & PERFORMANCE OPTIMIZATION

### Current Capacity
- 10,000 requests/day
- 500 concurrent users
- 50GB database

### Optimization Steps (for scaling)

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Implement query caching with Redis
   - Use read replicas for reporting
   - Archive old orders to separate table

2. **API Optimization**
   - Implement API caching (Redis)
   - Use pagination for large datasets
   - Compress responses (gzip)
   - Implement CDN for images (Cloudinary)

3. **Frontend Optimization**
   - Code splitting
   - Image optimization
   - Lazy loading
   - Service workers for offline support

4. **Infrastructure Scaling**
   - Horizontal scaling (add more API servers)
   - Load balancing
   - Database replication
   - CDN for static files

### Performance Targets (After Optimization)
- 1,000,000 requests/day
- 5,000 concurrent users
- < 100ms API response time
- < 2s page load time

*/

// ============ SUPPORT & CONTACT ============

/**

## SUPPORT & RESOURCES

### Getting Help

1. **API Documentation**: /docs/API.md
2. **Deployment Guide**: /docs/DEPLOYMENT.md
3. **Security Guide**: /docs/SECURITY.md
4. **SEO Guide**: /docs/SEO.md

### Contact Information
- **Support Email**: support@jamiihardware.com
- **Business Phone**: +254712345678
- **WhatsApp**: https://wa.me/254712345678
- **Location**: Bulbul, Kenya (Opposite Rubis Petrol Station)

### License
MIT License - See LICENSE file for details

### Version
Current: v1.0.0 (2024)

### Changelog
- v1.0.0: Initial release with all core features
  - Full eCommerce platform
  - Admin dashboard
  - Payment integration (M-Pesa)
  - Email & SMS notifications
  - Analytics dashboard
  - Security hardening

---

** Created with ❤️ for Jamii Hardware Team **

*/
