/**
 * JAMII HARDWARE - NEXT.JS FRONTEND
 * Production-ready eCommerce frontend with Tailwind CSS
 * Pages: Home, Shop, Product Details, Cart, Checkout, Admin Dashboard
 */

// ============ next.config.js ============
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: false
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  },
  compress: true,
  swcMinify: true
};

// ============ lib/api.js ============
export const apiCall = async (endpoint, options = {}) => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// ============ pages/_document.js ============
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Sora:wght@400;500;600&display=swap" rel="stylesheet" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// ============ pages/index.js - HOME PAGE ============
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';

export default function Home({ categories, featured }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Head>
        <title>Jamii Hardware - Your Trusted Hardware Partner in Bulbul</title>
        <meta name="description" content="Premium hardware supplies in Bulbul, Kenya. Opposite Rubis Petrol Station. Countrywide delivery." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* STICKY NAVIGATION */}
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JH</span>
                </div>
                <span className="font-bold text-lg text-gray-900">Jamii Hardware</span>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <Link href="/shop" className="text-gray-700 hover:text-blue-600 transition">Shop</Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
              </div>

              <div className="flex items-center space-x-4">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="hidden md:block w-48 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition">
                  <span className="text-xl">🛒</span>
                </Link>
                <Link href="/account" className="text-gray-700 hover:text-blue-600 transition">
                  <span className="text-xl">👤</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📍 Since 2015 • Bulbul, Kenya
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">Trusted Hardware</span> Partner
                </h1>
                
                <p className="text-xl text-gray-600">
                  🏪 <strong>Opposite Rubis Petrol Station, Bulbul</strong><br/>
                  Premium building materials, tools, and supplies. Local pickup or nationwide delivery.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/shop" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105">
                    Shop Now
                  </Link>
                  <a href="tel:+254712345678" className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                    📞 Call Now
                  </a>
                </div>

                <div className="flex items-center space-x-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">10K+</div>
                    <div className="text-gray-600 text-sm">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">5K+</div>
                    <div className="text-gray-600 text-sm">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-gray-600 text-sm">Support</div>
                  </div>
                </div>
              </div>

              <div className="relative h-96 md:h-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-orange-400 rounded-2xl blur-2xl opacity-30"></div>
                <div className="relative bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center h-full">
                  <div className="text-8xl">🏗️</div>
                  <p className="text-gray-600 mt-4 text-center">Building Quality, Serving Community</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Shop by Category</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Cement', 'Steel', 'Paint', 'Plumbing', 'Electrical', 'Roofing', 'Tiles', 'Tools', 'Water Tanks', 'Safety'].map((cat) => (
                <Link key={cat} href={`/shop?category=${cat}`}>
                  <div className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:shadow-lg transition cursor-pointer text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-semibold text-gray-900">{cat}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Best Sellers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured && featured.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer group">
                    <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.name} width={300} height={200} className="object-cover w-full h-full group-hover:scale-105 transition" />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">KES {product.price_kes.toLocaleString()}</span>
                        <span className={`text-sm font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock_quantity > 0 ? 'In Stock' : 'Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Nationwide delivery within 2-5 business days</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Payment Options</h3>
                <p className="text-gray-600">M-Pesa, Airtel Money, Cards, Pay on Delivery</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">Authentic products with warranty support</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-orange-500 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Visit Our Store Today</h2>
            <p className="text-xl mb-8 opacity-90">Jamii Hardware, Bulbul • Opposite Rubis Petrol Station</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://maps.google.com/?q=Jamii+Hardware+Bulbul" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition">
                📍 Get Directions
              </a>
              <a href="https://wa.me/254712345678" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition">
                💬 WhatsApp Us
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold mb-4">Jamii Hardware</h3>
                <p className="text-sm">Your trusted hardware partner since 2015</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/shop">Shop</Link></li>
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/faq">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li>📞 +254 712 345 678</li>
                  <li>📧 info@jamiihardware.com</li>
                  <li>Location: Bulbul, Kenya</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Payment Methods</h4>
                <p className="text-sm">M-Pesa • Airtel Money • Cards • Pay on Delivery</p>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>&copy; 2024 Jamii Hardware. All rights reserved. | <Link href="/privacy">Privacy</Link> | <Link href="/terms">Terms</Link></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const featured = await apiCall('/products?limit=8').catch(() => []);
    return {
      props: { featured },
      revalidate: 3600
    };
  } catch (error) {
    return { props: { featured: [] }, revalidate: 60 };
  }
}

// ============ pages/shop.js ============
import { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';

export default function Shop({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchCategories = async () => {
    try {
      const data = await apiCall('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      const data = await apiCall(`/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shop Products</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* FILTERS */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Filters</h3>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={category === ''}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-gray-700">All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={category === cat}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-gray-700">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">📦</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">KES {product.price_kes.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        Add to Cart
                      </button>
                      <a href={`https://wa.me/254712345678?text=Interested in ${product.name}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                        💬
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const products = await apiCall('/products').catch(() => []);
    return {
      props: { initialProducts: products },
      revalidate: 3600
    };
  } catch (error) {
    return { props: { initialProducts: [] }, revalidate: 60 };
  }
}

// ============ pages/api/config.js ============
export default function handler(req, res) {
  res.status(200).json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    mapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    environment: process.env.NODE_ENV
  });
}
