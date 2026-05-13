/**
 * JAMII HARDWARE - BACKEND API SERVER
 * Production-ready Express.js + PostgreSQL backend
 * Includes: Auth, Products, Orders, Payments, Admin, Analytics
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const multer = require('multer');
const axios = require('axios');
const crypto = require('crypto');

// ============ INITIALIZATION ============
const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://jamii:password@localhost:5432/jamii_hardware'
});

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// ============ AUTHENTICATION ============
const JWT_SECRET = process.env.JWT_SECRET || 'jamii-hardware-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

// Verify JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Verify Admin Role
const authorizeAdmin = (req, res, next) => {
  if (!req.user || !['owner', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ============ DATABASE INITIALIZATION ============
const initializeDatabase = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        county VARCHAR(100),
        postal_code VARCHAR(10),
        role VARCHAR(50) DEFAULT 'customer',
        user_type VARCHAR(50) DEFAULT 'retail',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price_kes DECIMAL(10, 2) NOT NULL,
        wholesale_price_kes DECIMAL(10, 2),
        stock_quantity INT DEFAULT 0,
        min_stock_level INT DEFAULT 10,
        image_url VARCHAR(500),
        images_json JSON,
        specifications JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INT REFERENCES users(id),
        subtotal_kes DECIMAL(12, 2),
        delivery_fee_kes DECIMAL(10, 2) DEFAULT 0,
        discount_kes DECIMAL(10, 2) DEFAULT 0,
        total_kes DECIMAL(12, 2),
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        order_status VARCHAR(50) DEFAULT 'pending',
        delivery_address TEXT,
        delivery_county VARCHAR(100),
        delivery_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Order items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id),
        product_id INT REFERENCES products(id),
        quantity INT,
        unit_price_kes DECIMAL(10, 2),
        total_kes DECIMAL(12, 2)
      );
    `);

    // Inventory logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id),
        old_quantity INT,
        new_quantity INT,
        change_reason VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Promo codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent DECIMAL(5, 2),
        discount_amount_kes DECIMAL(10, 2),
        min_order_amount_kes DECIMAL(10, 2),
        valid_from DATE,
        valid_until DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, full_name, phone, user_type } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, user_type, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, user_type',
      [email, hashedPassword, full_name, phone, user_type || 'retail', 'customer']
    );

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: result.rows[0],
      token
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        user_type: user.user_type
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PRODUCT ROUTES ============
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CART & CHECKOUT ============
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, delivery_address, delivery_county, payment_method, promo_code } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const product = await pool.query('SELECT price_kes FROM products WHERE id = $1', [item.product_id]);
      if (product.rows.length === 0) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      subtotal += product.rows[0].price_kes * item.quantity;
    }

    // Apply promo code
    let discount = 0;
    if (promo_code) {
      const promo = await pool.query('SELECT * FROM promo_codes WHERE code = $1 AND is_active = true', [promo_code]);
      if (promo.rows.length > 0) {
        const p = promo.rows[0];
        if (subtotal >= (p.min_order_amount_kes || 0)) {
          discount = p.discount_amount_kes || (subtotal * p.discount_percent / 100);
        }
      }
    }

    // Delivery fee based on county
    const deliveryFees = {
      'Nairobi': 200,
      'Kajiado': 300,
      'Kiambu': 300,
      'Machakos': 400,
      'Nakuru': 500
    };
    const delivery_fee = deliveryFees[delivery_county] || 600;

    const total = subtotal + delivery_fee - discount;
    const order_number = 'JH' + Date.now();

    const orderResult = await pool.query(
      'INSERT INTO orders (order_number, user_id, subtotal_kes, delivery_fee_kes, discount_kes, total_kes, payment_method, delivery_address, delivery_county) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, order_number, total_kes, payment_status',
      [order_number, req.user.id, subtotal, delivery_fee, discount, total, payment_method, delivery_address, delivery_county]
    );

    const order_id = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      const product = await pool.query('SELECT price_kes FROM products WHERE id = $1', [item.product_id]);
      const unit_price = product.rows[0].price_kes;
      
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price_kes, total_kes) VALUES ($1, $2, $3, $4, $5)',
        [order_id, item.product_id, item.quantity, unit_price, unit_price * item.quantity]
      );

      // Update inventory
      await pool.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({
      message: 'Order created',
      order: orderResult.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:order_id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.order_id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.order_id]);
    
    res.json({
      ...result.rows[0],
      items: items.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ M-PESA PAYMENT INTEGRATION ============
const getMpesaToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

app.post('/api/payments/mpesa', authenticateToken, async (req, res) => {
  try {
    const { order_id, phone_number } = req.body;

    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(order.rows[0].total_kes),
        PartyA: phone_number,
        PartyB: process.env.MPESA_BUSINESS_CODE,
        PhoneNumber: phone_number,
        CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`,
        AccountReference: order.rows[0].order_number,
        TransactionDesc: `Payment for ${order.rows[0].order_number}`
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      message: 'STK push sent',
      checkoutRequestId: response.data.CheckoutRequestID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const result = Body.stkCallback.CallbackMetadata?.ItemList || [];
    const resultCode = Body.stkCallback.ResultCode;

    if (resultCode === 0) {
      const reference = Body.stkCallback.CheckoutRequestID;
      // Update order status to paid
      await pool.query(
        'UPDATE orders SET payment_status = $1, order_status = $2 WHERE order_number = $3',
        ['paid', 'confirmed', reference]
      );
    }

    res.json({ ResultCode: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN ROUTES ============
app.post('/api/admin/products', authenticateToken, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price_kes, stock_quantity, description } = req.body;
    const sku = 'JH-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const result = await pool.query(
      'INSERT INTO products (sku, name, category, price_kes, stock_quantity, description, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [sku, name, category, price_kes, stock_quantity, description, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, category, price_kes, stock_quantity, description } = req.body;
    
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, price_kes = $3, stock_quantity = $4, description = $5 WHERE id = $6 RETURNING *',
      [name, category, price_kes, stock_quantity, description, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/analytics', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalRevenue = await pool.query('SELECT SUM(total_kes) as total FROM orders WHERE payment_status = $1', ['paid']);
    const totalOrders = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalCustomers = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['customer']);
    const lowStockProducts = await pool.query('SELECT * FROM products WHERE stock_quantity <= min_stock_level AND is_active = true');

    res.json({
      totalRevenue: totalRevenue.rows[0].total || 0,
      totalOrders: totalOrders.rows[0].count,
      totalCustomers: totalCustomers.rows[0].count,
      lowStockProducts: lowStockProducts.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============ SERVER START ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Jamii Hardware API running on port ${PORT}`);
});

module.exports = app;
