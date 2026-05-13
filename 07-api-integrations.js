/**
 * JAMII HARDWARE - API DOCUMENTATION & INTEGRATIONS
 * Complete API reference, payment integration, and third-party services setup
 */

// ============ API DOCUMENTATION ============

/**

## JAMII HARDWARE API REFERENCE

### BASE URL
Production: https://api.jamiihardware.com/api
Development: http://localhost:5000/api

### AUTHENTICATION
All endpoints (except login/register) require JWT token in header:
Authorization: Bearer {token}

### RESPONSE FORMAT
{
  "status": "success|error",
  "data": {...},
  "message": "..."
}

---

## AUTHENTICATION ENDPOINTS

### 1. Register User
POST /auth/register

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Mwangi",
  "phone": "+254712345678",
  "user_type": "retail" // or "wholesale"
}

Response (201):
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Mwangi",
    "role": "customer",
    "user_type": "retail"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

### 2. Login
POST /auth/login

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "message": "Login successful",
  "user": {...},
  "token": "..."
}

---

## PRODUCTS ENDPOINTS

### 1. Get All Products
GET /products?category=Cement&search=50kg&limit=20&offset=0

Response (200):
[
  {
    "id": 1,
    "sku": "JH-CEMENT-001",
    "name": "Portland Cement 50kg",
    "category": "Cement",
    "price_kes": 450,
    "wholesale_price_kes": 400,
    "stock_quantity": 150,
    "description": "High quality Portland cement",
    "image_url": "https://...",
    "is_featured": true,
    "rating": 4.5,
    "review_count": 125
  }
]

### 2. Get Product Details
GET /products/{id}

Response (200):
{
  "id": 1,
  "sku": "JH-CEMENT-001",
  "name": "Portland Cement 50kg",
  "category": "Cement",
  "price_kes": 450,
  "wholesale_price_kes": 400,
  "contractor_price_kes": 380,
  "stock_quantity": 150,
  "description": "...",
  "detailed_description": "...",
  "specifications": {
    "weight": "50kg",
    "type": "Portland",
    "strength": "42.5N"
  },
  "images": [...],
  "warranty_months": 0,
  "rating": 4.5,
  "review_count": 125,
  "related_products": [...]
}

### 3. Get Categories
GET /categories

Response (200):
["Cement", "Steel", "Paint", "Plumbing", "Electrical", "Roofing", "Tiles", "Tools", "Water Tanks", "Safety Equipment"]

### 4. Search Products
GET /products?search=cement 50kg

---

## CART & ORDERS ENDPOINTS

### 1. Create Order
POST /orders
Authorization: Bearer {token}

Request:
{
  "items": [
    {
      "product_id": 1,
      "quantity": 10
    }
  ],
  "delivery_address": "123 Main Street, Bulbul",
  "delivery_county": "Kajiado",
  "payment_method": "mpesa",
  "promo_code": "SAVE10" // optional
}

Response (201):
{
  "message": "Order created",
  "order": {
    "id": 1,
    "order_number": "JH1234567890",
    "subtotal_kes": 4500,
    "delivery_fee_kes": 300,
    "discount_kes": 450,
    "total_kes": 4350,
    "payment_status": "pending",
    "order_status": "pending"
  }
}

### 2. Get Order Details
GET /orders/{order_id}
Authorization: Bearer {token}

Response (200):
{
  "id": 1,
  "order_number": "JH1234567890",
  "total_kes": 4350,
  "payment_status": "pending",
  "order_status": "pending",
  "items": [
    {
      "product_id": 1,
      "product_name": "Portland Cement 50kg",
      "quantity": 10,
      "unit_price_kes": 450,
      "total_kes": 4500
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}

---

## PAYMENT ENDPOINTS

### 1. Initiate M-Pesa Payment
POST /payments/mpesa
Authorization: Bearer {token}

Request:
{
  "order_id": 1,
  "phone_number": "254712345678"
}

Response (200):
{
  "message": "STK push sent",
  "checkoutRequestId": "ws_CO_DMZ_..."
}

Customer will receive STK popup on their phone.

### 2. Payment Callback (Webhook)
POST /payments/mpesa/callback

(Receives callback from Safaricom)

### 3. Get Payment Status
GET /orders/{order_id}/payment-status
Authorization: Bearer {token}

Response (200):
{
  "order_number": "JH1234567890",
  "payment_status": "paid",
  "payment_method": "mpesa",
  "mpesa_receipt": "LH411V1IK0",
  "transaction_date": "2024-01-15T11:00:00Z"
}

---

## DELIVERY ENDPOINTS

### 1. Get Delivery Fee
GET /delivery/quote?county=Nairobi&total_kes=5000

Response (200):
{
  "county": "Nairobi",
  "delivery_fee": 200,
  "estimated_days": "1-2",
  "delivery_partner": "JNT Express"
}

### 2. Track Delivery
GET /orders/{order_id}/tracking
Authorization: Bearer {token}

Response (200):
{
  "tracking_number": "TRK123456789",
  "status": "in_transit",
  "current_location": "Nairobi Distribution Center",
  "estimated_delivery": "2024-01-16T15:00:00Z",
  "driver_phone": "+254712345678"
}

---

## ADMIN ENDPOINTS

### 1. Create Product
POST /admin/products
Authorization: Bearer {admin_token}

Request:
{
  "name": "New Product",
  "category": "Cement",
  "price_kes": 500,
  "wholesale_price_kes": 450,
  "stock_quantity": 100,
  "description": "Product description",
  "sku": "JH-AUTO" // auto-generated if not provided
}

Response (201):
{...product object...}

### 2. Update Product
PUT /admin/products/{id}
Authorization: Bearer {admin_token}

Request:
{
  "name": "Updated Name",
  "price_kes": 550,
  "stock_quantity": 80
}

Response (200):
{...updated product...}

### 3. Dashboard Analytics
GET /admin/analytics
Authorization: Bearer {admin_token}

Response (200):
{
  "totalRevenue": 2500000,
  "totalOrders": 450,
  "totalCustomers": 1250,
  "lowStockProducts": [...]
}

### 4. Get Orders
GET /admin/orders?status=pending&limit=20
Authorization: Bearer {admin_token}

### 5. Update Order Status
PATCH /admin/orders/{id}
Authorization: Bearer {admin_token}

Request:
{
  "order_status": "shipped",
  "admin_notes": "Order dispatched with JNT"
}

---

## ERROR RESPONSES

400 Bad Request:
{
  "error": "Missing required field: email"
}

401 Unauthorized:
{
  "error": "Access token required"
}

403 Forbidden:
{
  "error": "Admin access required"
}

404 Not Found:
{
  "error": "Product not found"
}

409 Conflict:
{
  "error": "Email already registered"
}

429 Too Many Requests:
{
  "error": "Too many requests, please try again later"
}

500 Internal Server Error:
{
  "error": "Internal server error"
}

*/

// ============ M-PESA INTEGRATION GUIDE ============

/**

## M-PESA INTEGRATION SETUP

### 1. Register with Safaricom Daraja

1. Visit: https://developer.safaricom.co.ke
2. Create account and login
3. Create application in sandbox environment
4. Get credentials:
   - Consumer Key
   - Consumer Secret
   - Business Short Code (174379)
   - Pass Key (bfb279f9aa9bdbcf158e97dd71a467cd)

### 2. Add to Environment Variables

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd
BACKEND_URL=https://yourdomain.com

### 3. Configuration in Backend

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessCode: process.env.MPESA_BUSINESS_CODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`
};

### 4. Test Transaction Flow

1. Create order (KES 1000)
2. Call STK push with phone number
3. Approve payment on phone
4. Verify callback response
5. Update order status to "paid"

### 5. Go Live

1. Complete Safaricom verification
2. Move to production credentials
3. Test with real transactions
4. Update environment variables
5. Monitor transactions

### 6. Troubleshooting

- "Checkout not initiated" → Check phone number format (+254xxxxxxxxx)
- "Invalid Business Code" → Verify MPESA_BUSINESS_CODE
- "Token generation failed" → Check credentials
- "SSL verification failed" → Ensure HTTPS is enabled

*/

// ============ EMAIL SERVICE INTEGRATION ============

/**

## EMAIL SERVICE SETUP (SendGrid)

### 1. Sign Up

1. Visit: https://sendgrid.com
2. Create account
3. Get API Key
4. Add to environment: SENDGRID_API_KEY=SG.xxxxxxxxxx

### 2. Email Templates

### Order Confirmation Email

Subject: Order Confirmation - [ORDER_NUMBER]

Template:
<h1>Order Confirmed!</h1>
<p>Hi {CUSTOMER_NAME},</p>
<p>Thank you for your order #{ORDER_NUMBER}.</p>

<h3>Order Summary:</h3>
<ul>
  {ITEMS_LIST}
</ul>

<p><strong>Total: KES {TOTAL:,}</strong></p>

<h3>Payment Status: {PAYMENT_STATUS}</h3>
<h3>Delivery Address: {DELIVERY_ADDRESS}</h3>
<p>Estimated Delivery: {ESTIMATED_DATE}</p>

<p><a href="{TRACKING_LINK}">Track Your Order</a></p>

### Payment Confirmation Email

Subject: Payment Received - KES {AMOUNT:,}

Template:
<h1>Payment Received</h1>
<p>Your payment of KES {AMOUNT:,} has been received.</p>
<p>Receipt: {RECEIPT_NUMBER}</p>
<p>Date: {DATE_TIME}</p>

### Shipping Notification Email

Subject: Your Order is on the Way!

Template:
<h1>Order Shipped</h1>
<p>Order #{ORDER_NUMBER} has been dispatched.</p>
<p>Tracking Number: {TRACKING_NUMBER}</p>
<p>Carrier: {CARRIER_NAME}</p>
<p><a href="{TRACKING_URL}">Track Package</a></p>

### 3. Implementation

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOrderConfirmation(order) {
  const msg = {
    to: order.customer.email,
    from: 'noreply@jamiihardware.com',
    subject: `Order Confirmation - ${order.order_number}`,
    html: generateOrderEmailTemplate(order)
  };

  await sgMail.send(msg);
}

*/

// ============ SMS INTEGRATION (Africa's Talking) ============

/**

## SMS NOTIFICATIONS SETUP

### 1. Register with Africa's Talking

1. Visit: https://africastalking.com
2. Create account
3. Get API Key
4. Add phone number for testing

### 2. SMS Events

1. Order Confirmation
   "Hi {NAME}, your order #{ORDER_ID} has been confirmed. Total: KES {AMOUNT}. Track: {LINK}"

2. Payment Confirmation
   "Payment of KES {AMOUNT} received for order #{ORDER_ID}. Receipt: {RECEIPT}"

3. Shipping Notification
   "Your order #{ORDER_ID} is on the way! Track: {LINK}. Est. Delivery: {DATE}"

4. Delivery Confirmation
   "Order #{ORDER_ID} delivered. Thank you for shopping at Jamii Hardware!"

### 3. Implementation

const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME
});

async function sendSMS(phoneNumber, message) {
  try {
    const result = await at.SMS.send({
      recipients: [phoneNumber],
      message: message
    });
    return result;
  } catch (error) {
    console.error('SMS send failed:', error);
  }
}

*/

// ============ GOOGLE MAPS INTEGRATION ============

/**

## GOOGLE MAPS SETUP

### 1. Get API Key

1. Visit: https://console.cloud.google.com
2. Create new project "Jamii Hardware"
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
4. Create API Key (Restrict to web browsers)
5. Add to environment: NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

### 2. Display Store Location

<GoogleMap
  center={{ lat: -1.2921, lng: 36.8219 }}
  zoom={15}
  markers={[
    {
      lat: -1.2921,
      lng: 36.8219,
      title: 'Jamii Hardware',
      description: 'Opposite Rubis Petrol Station, Bulbul'
    }
  ]}
/>

### 3. Calculate Delivery Distance

async function calculateDeliveryFee(destination) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?
    origins=Bulbul,Kenya
    &destinations=${destination}
    &key=${GOOGLE_MAPS_KEY}`
  );
  const data = await response.json();
  const distance = data.rows[0].elements[0].distance.value / 1000; // km
  const fee = calculateFeeByKm(distance);
  return fee;
}

*/

// ============ CLOUDINARY IMAGE HOSTING ============

/**

## CLOUDINARY SETUP

### 1. Create Account

1. Visit: https://cloudinary.com
2. Sign up (free tier available)
3. Get credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configuration

CLOUDINARY_CLOUD_NAME=jamii_hardware
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

### 3. Upload Product Images

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadProductImage(file, productSku) {
  const result = await cloudinary.uploader.upload(file, {
    folder: 'jamii-hardware/products',
    public_id: productSku,
    quality: 'auto',
    fetch_format: 'auto'
  });
  
  return result.secure_url;
}

### 4. Image Optimization

cloudinary automatically provides:
- Responsive images
- Automatic format selection
- Compression
- CDN delivery

Use transformation URLs:
https://res.cloudinary.com/jamii_hardware/image/upload/
  w_500,h_500,c_fill,q_auto,f_auto/products/JH-CEMENT-001

*/

// ============ STRIPE PAYMENT INTEGRATION (Optional) ============

/**

## STRIPE SETUP (Alternative to M-Pesa)

### 1. Create Stripe Account

1. Visit: https://stripe.com
2. Create account
3. Enable Kenya (KES currency)
4. Get keys:
   - Publishable Key (pk_live_...)
   - Secret Key (sk_live_...)

### 2. Configuration

STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

### 3. Frontend Implementation

const stripe = Stripe(STRIPE_PUBLIC_KEY);

async function createPaymentIntent(amountKES) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountKES })
  });
  
  const { clientSecret } = await response.json();
  return clientSecret;
}

### 4. Webhook Handling

app.post('/api/stripe-webhook', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update order to paid
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
});

*/

