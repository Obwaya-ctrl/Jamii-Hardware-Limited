/**
 * JAMII HARDWARE - SEO, SECURITY & TESTING DOCUMENTATION
 * Complete guides for optimization, security, and quality assurance
 */

// ============ SEO STRATEGY GUIDE ============

/**

## SEO STRATEGY FOR JAMII HARDWARE

### 1. LOCAL SEO OPTIMIZATION

**Primary Keywords:**
- Hardware store Bulbul
- Hardware supplier Kenya
- Building materials Bulbul
- Construction supplies near me
- Hardware store opposite Rubis Bulbul
- Cement supplier Bulbul
- Steel rods Nairobi
- Electrical supplies Kenya

**Local SEO Implementation:**

1. Google My Business Optimization
   - Business name: Jamii Hardware
   - Address: Bulbul, Kenya (Opposite Rubis Petrol Station)
   - Phone: +254712345678
   - Hours: Monday-Sunday 8:00 AM - 6:00 PM
   - Add high-quality photos
   - Encourage customer reviews
   - Post regular updates about products and promotions

2. Local Schema Markup (JSON-LD)
   - LocalBusiness schema
   - Organization schema
   - Store address and hours
   - Contact information

3. Local Link Building
   - Kenya business directories
   - Local supplier networks
   - Contractor associations
   - Construction groups

4. Location-Specific Content
   - "Hardware Supplies in Bulbul"
   - "Where to Buy Cement in Bulbul"
   - "Best Hardware Store Near Rubis, Bulbul"

### 2. ON-PAGE SEO

**Meta Tags for Each Page:**

Homepage:
- Title: "Jamii Hardware - Premium Building Materials & Supplies in Bulbul, Kenya"
- Description: "Your trusted hardware partner in Bulbul, Kenya opposite Rubis Petrol Station. Quality cement, steel, paint, plumbing supplies & more. Nationwide delivery."
- Keywords: "hardware store bulbul, building materials kenya, cement supplier"

Shop Page:
- Title: "Buy Hardware Online - Cement, Steel, Paint, Plumbing & Tools | Jamii Hardware"
- Description: "Shop high-quality building materials online. Fast delivery across Kenya. Best prices on cement, steel, electrical, roofing, tiles and more."

Product Pages:
- Unique title with product name and key features
- Detailed meta description (150-160 chars)
- Target long-tail keywords

**Header Tags Structure:**
- H1: Product/Page main title (only one per page)
- H2: Category headings
- H3: Feature/benefit headings

**Content Optimization:**
- Target 300+ words per product description
- Include FAQ section
- User-generated reviews and ratings
- Image alt tags with keywords
- Internal linking strategy

### 3. TECHNICAL SEO

**Site Speed Optimization:**
- Google PageSpeed Insights score: > 90
- First Contentful Paint < 2 seconds
- Largest Contentful Paint < 2.5 seconds
- Cumulative Layout Shift < 0.1

**Mobile Optimization:**
- Responsive design (done with Tailwind)
- Mobile-first indexing
- Touch-friendly buttons
- Mobile usable form

**Structured Data (Schema.org):**
- LocalBusiness
- Organization
- BreadcrumbList
- Product
- Offer
- AggregateRating
- FAQPage

**XML & Robots:**
- sitemap.xml updated weekly
- robots.txt properly configured
- Canonical tags on all pages

### 4. CONTENT MARKETING STRATEGY

**DIY/Construction Blog Topics:**

1. "10 Essential Building Materials Every Homeowner Needs"
2. "How to Choose the Right Cement for Your Project"
3. "Steel Rods vs Rebar: What's the Difference?"
4. "Paint Types Explained: Interior vs Exterior"
5. "Plumbing Guide: PVC vs Copper Pipes"
6. "Electrical Safety Tips for DIY Projects"
7. "Roofing Materials Comparison: Cost vs Durability"
8. "Tile Selection Guide for Different Rooms"
9. "Essential Power Tools Every Contractor Needs"
10. "Water Tank Installation and Maintenance"

**Blog SEO Tips:**
- Publish 2x per week
- 1,500+ words per article
- Include high-quality images
- Update old articles quarterly
- Internal linking
- Share on social media
- Optimize for featured snippets

### 5. LINK BUILDING STRATEGY

**Internal Linking:**
- Link related products
- Link category pages from homepage
- Create content clusters around topics
- Use descriptive anchor text

**External Links:**
- Get backlinks from construction industry blogs
- Supplier directories
- Local Kenya business sites
- News articles about business
- Partnerships with contractors

**Backlink Targets:**
- BuildersKenya.com
- ConstructionKenya.org
- HardwareDealers.co.ke
- LocalBusinessKenya.com
- TradesmenNetwork.co.ke

### 6. GOOGLE ANALYTICS & MONITORING

**Key Metrics to Track:**
- Organic traffic by page
- Conversion rate (Add to Cart, Checkout)
- Bounce rate
- Avg session duration
- Device type breakdown
- Traffic source breakdown
- Search queries performance

**Google Search Console:**
- Monitor indexed pages
- Fix crawl errors
- Mobile usability issues
- Fix structured data errors
- Monitor search performance

### 7. RICH SNIPPETS

Implement for:
- Star ratings (products)
- Price (products)
- Availability (in stock/out of stock)
- Business hours
- Review count
- FAQ items

### 8. SOCIAL SIGNALS

**Social Media Strategy:**
- Facebook: Daily product posts, customer testimonials
- Instagram: Product photos, construction projects, behind-the-scenes
- TikTok: Quick DIY tips, product demonstrations
- LinkedIn: B2B content, contractor partnerships
- WhatsApp Business: Customer support, order updates

**Cross-Linking:**
- Add social media buttons on website
- Share blog posts on all platforms
- Encourage reviews on Google & Facebook

### 9. LOCAL SEO QUICK WINS**

1. Add "Open Now" feature to Google My Business
2. Post weekly "shop updates" with special offers
3. Encourage customer reviews with QR code in store
4. Create location-specific landing pages
5. Add photos of products and store
6. List on local directories:
   - ZoomInfo
   - KenyaTrade.com
   - Jumia Business
   - Local BNI groups

*/

// ============ SECURITY IMPLEMENTATION GUIDE ============

/**

## SECURITY IMPLEMENTATION CHECKLIST

### 1. AUTHENTICATION & AUTHORIZATION

✅ JWT (JSON Web Tokens)
- Implementation: server.js (lines 45-50)
- Expiration: 7 days
- Stored securely in httpOnly cookies (frontend)

✅ Password Security
- Bcrypt hashing (10 salt rounds)
- No plaintext passwords stored
- Password reset via email link

✅ Role-Based Access Control (RBAC)
- Roles: owner, manager, cashier, customer, contractor
- Middleware: authorizeAdmin (line 59-63)

### 2. DATA PROTECTION

✅ HTTPS/TLS
- Enforce in nginx.conf
- 301 redirect HTTP → HTTPS
- HSTS header: max-age=31536000

✅ SQL Injection Prevention
- Parameterized queries (pool.query)
- No string concatenation in SQL
- Input validation with express-validator

✅ XSS (Cross-Site Scripting) Prevention
- Helmet.js headers
- Content-Security-Policy headers
- Sanitize user input
- Escape output in templates

✅ CSRF (Cross-Site Request Forgery) Prevention
- Implement csrf-sync or similar
- Add to checkout/payment forms
- Validate tokens on server

### 3. API SECURITY

✅ Rate Limiting
- 100 requests/15 minutes (general)
- 5 requests/15 minutes (login)
- Configured in server.js (lines 30-36)

✅ CORS (Cross-Origin Resource Sharing)
- Whitelist domains
- Credentials: true for cookies
- Origin validation

✅ API Authentication
- All endpoints require JWT (except login/register)
- Verify token validity
- Check user permissions

✅ Input Validation
- Type checking
- Length limits
- Format validation (email, phone)

### 4. PAYMENT SECURITY

✅ M-Pesa Integration
- Use official Daraja API
- Verify transaction callbacks
- Store transaction reference
- PCI DSS compliance

✅ Card Payments (if implemented)
- Use Stripe/PayPal (never store card data)
- Tokenization for recurring payments
- 3D Secure for additional security

✅ Payment Data
- Never log sensitive payment info
- Encrypt payment reference numbers
- Use secure webhooks for confirmation

### 5. DATABASE SECURITY

✅ Connection Security
- Use connection pooling
- SSL connections (pg library supports it)
- Change default database password
- Limit user permissions

✅ Backup Security
- Encrypt backups
- Store offsite (AWS S3 with SSE)
- Test restore procedures
- Automate daily backups

✅ Query Security
- Parameterized queries only
- Whitelist allowed columns
- Limit database user permissions
- Use views for sensitive data

### 6. FILE UPLOAD SECURITY

✅ Implementation (server.js, lines 24-38)
- File type validation (images only)
- File size limits (5MB)
- Rename files with UUID
- Store outside web root
- Use CDN (Cloudinary)

✅ Prevent Attacks
- No executable uploads
- Scan uploads for malware
- Validate MIME types
- Store in secure location

### 7. INFRASTRUCTURE SECURITY

✅ Server Hardening
- Disable unused services
- Regular security updates
- Strong SSH keys
- Fail2ban for brute force
- UFW firewall rules

✅ Environment Variables
- Never commit .env files
- Use secrets manager (AWS Secrets)
- Rotate keys regularly
- Different keys per environment

✅ SSL/TLS Certificates
- Use Let's Encrypt (free, auto-renew)
- Strong cipher suites
- TLS 1.2+ only
- Certificate pinning (optional)

### 8. LOGGING & MONITORING

✅ Security Logging
- Log failed login attempts
- Log payment transactions
- Log admin actions (audit logs)
- Log suspicious activity

✅ Monitoring
- Real-time alerts for:
  - Multiple failed logins
  - Unusual traffic patterns
  - Payment failures
  - Database errors

✅ Tools
- Sentry (error tracking)
- DataDog (monitoring)
- ELK Stack (logging)
- Cloudwatch (AWS)

### 9. COMPLIANCE

✅ GDPR (if EU customers)
- Privacy policy
- Cookie consent
- Data export/deletion
- Right to be forgotten

✅ Kenya Data Protection
- Kenya Data Protection Act
- Privacy policy
- Data retention policy
- Consent management

✅ PCI DSS (Payment Card Industry)
- If accepting cards directly
- Regular security audits
- Vulnerability scans
- Incident response plan

### 10. INCIDENT RESPONSE

**Steps if Breach Occurs:**
1. Immediately isolate affected systems
2. Notify affected users
3. Reset vulnerable passwords
4. Review logs to understand scope
5. Fix vulnerabilities
6. Monitor for re-exploitation

*/

// ============ TESTING STRATEGY ============

/**

## TESTING PLAN FOR JAMII HARDWARE

### 1. UNIT TESTS

**Backend Tests:**
- Authentication tests
- API endpoint tests
- Database query tests
- Payment integration tests

Example Jest test file:

describe('Authentication', () => {
  test('register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        full_name: 'Test User'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  test('login with correct credentials', async () => {
    // ... test login
  });

  test('reject invalid credentials', async () => {
    // ... test failed login
  });
});

describe('Products API', () => {
  test('fetch all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('filter products by category', async () => {
    const res = await request(app).get('/api/products?category=Cement');
    expect(res.status).toBe(200);
  });
});

**Frontend Tests:**
- Component rendering
- User interactions
- Form validation
- Cart operations

### 2. INTEGRATION TESTS

- User registration → login → browse → cart → checkout
- Product search → filter → details → order
- Admin login → product management → inventory update
- Payment flow: M-Pesa → order confirmation → email

### 3. END-TO-END TESTS (E2E)

**Tools:** Playwright or Cypress

Scenarios:
1. Customer browsing journey
2. Complete purchase flow
3. Admin order management
4. Search and filtering
5. Payment processing
6. Customer account management

### 4. PERFORMANCE TESTS

**Load Testing:**
- Simulate 1000+ concurrent users
- Check response times
- Monitor database performance
- Identify bottlenecks

**Tools:** Apache JMeter, LoadRunner

**Targets:**
- API response time < 200ms
- Database query time < 100ms
- Page load time < 2s
- Support 10,000 requests/day

### 5. SECURITY TESTS

**Penetration Testing:**
- SQL injection attempts
- XSS payload injection
- CSRF token bypass
- Authentication bypass
- Rate limiting bypass

**OWASP Top 10 Checks:**
1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities
5. Broken Access Control
6. Security Misconfiguration
7. XSS
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging

**Tools:**
- OWASP ZAP
- Burp Suite
- SonarQube

### 6. USABILITY TESTS

**Manual Testing:**
- Test on multiple devices
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness
- Accessibility (WCAG 2.1 AA)

**Tools:**
- BrowserStack
- Lighthouse
- aXe DevTools

### 7. REGRESSION TESTS

**Automated Tests After Updates:**
- Run full test suite on each commit
- Check critical user paths
- Verify API contracts
- Database integrity

### 8. UAT (User Acceptance Testing)

**Test with Real Users:**
- Contractors testing bulk orders
- Customers testing shopping flow
- Admin testing dashboard
- Feedback collection

### 9. TEST COVERAGE TARGETS

- Overall: > 80% code coverage
- Critical paths: 100%
- API endpoints: 100%
- Utilities: > 90%

### 10. TESTING SCHEDULE

- Unit tests: Every commit
- Integration tests: Every 4 hours
- E2E tests: Daily
- Performance tests: Weekly
- Security tests: Monthly
- Load tests: Before major promotions
- UAT: Before production release

*/

// ============ API SECURITY HEADERS ============

// In express middleware:
const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'");
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  next();
};

app.use(securityHeaders);

// ============ RATE LIMITING CONFIGURATION ============

const createRateLimiter = (windowMs, max, keyGenerator) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator,
    skip: (req) => {
      // Skip rate limiting for health check
      return req.path === '/api/health';
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please try again later.'
      });
    }
  });
};

// Different rate limiters for different endpoints
const loginLimiter = createRateLimiter(15 * 60 * 1000, 5);
const appsLimiter = createRateLimiter(15 * 60 * 1000, 100);
const paymentLimiter = createRateLimiter(60 * 1000, 3);

app.post('/api/auth/login', loginLimiter, authController.login);
app.post('/api/payments/mpesa', paymentLimiter, paymentController.initiateMpesa);

