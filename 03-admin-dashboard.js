/**
 * JAMII HARDWARE - ADMIN DASHBOARD
 * Complete ERP-style management system
 * Features: Products, Inventory, Orders, Analytics, Users, Promotions
 */

// ============ pages/admin/dashboard.js ============
import { useState, useEffect } from 'react';
import { apiCall } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await apiCall('/admin/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center h-96">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
            <div className="text-3xl font-bold text-gray-900">KES {(analytics.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-green-600 text-sm mt-2">+12% from last month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Orders</h3>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalOrders}</div>
            <p className="text-green-600 text-sm mt-2">+8% this week</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Customers</h3>
            <div className="text-3xl font-bold text-gray-900">{analytics.totalCustomers}</div>
            <p className="text-green-600 text-sm mt-2">+5% new this month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Low Stock Items</h3>
            <div className="text-3xl font-bold text-gray-900">{analytics.lowStockProducts.length}</div>
            <p className="text-red-600 text-sm mt-2">Needs reordering</p>
          </div>
        </div>

        {/* LOW STOCK ALERTS */}
        {analytics.lowStockProducts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-yellow-900 mb-4">⚠️ Low Stock Alert</h2>
            <div className="space-y-2">
              {analytics.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded">
                  <span className="text-gray-900 font-semibold">{product.name}</span>
                  <span className="text-red-600 font-bold">{product.stock_quantity} units</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-blue-600">JH1234567890</td>
                  <td className="py-3 px-4 text-gray-900">John Mwangi</td>
                  <td className="py-3 px-4 text-gray-900">KES 45,500</td>
                  <td className="py-3 px-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Delivered</span></td>
                  <td className="py-3 px-4 text-gray-600">2024-01-15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ pages/admin/products.js ============
import { useState, useEffect } from 'react';
import { apiCall } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price_kes: '',
    wholesale_price_kes: '',
    stock_quantity: '',
    description: '',
    sku: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiCall('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/admin/products', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({
        name: '',
        category: '',
        price_kes: '',
        wholesale_price_kes: '',
        stock_quantity: '',
        description: '',
        sku: ''
      });
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const categories = [
    'Cement', 'Steel', 'Paint', 'Plumbing', 'Electrical',
    'Roofing', 'Tiles', 'Tools', 'Water Tanks', 'Safety Equipment'
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add Product
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="price_kes"
                  placeholder="Retail Price (KES)"
                  value={formData.price_kes}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="wholesale_price_kes"
                  placeholder="Wholesale Price (KES)"
                  value={formData.wholesale_price_kes}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  name="stock_quantity"
                  placeholder="Stock Quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  name="sku"
                  placeholder="SKU (Auto-generated)"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <textarea
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCTS TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">SKU</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Product Name</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Stock</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-semibold">{product.sku}</td>
                  <td className="py-4 px-6 text-gray-900">{product.name}</td>
                  <td className="py-4 px-6 text-gray-600">{product.category}</td>
                  <td className="py-4 px-6 text-gray-900 font-semibold">KES {product.price_kes}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      product.stock_quantity > product.min_stock_level
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-4 px-6 space-x-2">
                    <button className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                    <button className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ pages/admin/orders.js ============
import AdminLayout from '../../components/AdminLayout';
import { useState } from 'react';

export default function AdminOrders() {
  const [orders] = useState([
    {
      id: 1,
      order_number: 'JH1234567890',
      customer: 'John Mwangi',
      total_kes: 45500,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 2,
      order_number: 'JH1234567891',
      customer: 'Jane Kamau',
      total_kes: 32000,
      status: 'confirmed',
      date: '2024-01-14'
    },
    {
      id: 3,
      order_number: 'JH1234567892',
      customer: 'David Kipchoge',
      total_kes: 78900,
      status: 'shipped',
      date: '2024-01-13'
    }
  ]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Order #</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-semibold text-blue-600">{order.order_number}</td>
                  <td className="py-4 px-6 text-gray-900">{order.customer}</td>
                  <td className="py-4 px-6 text-gray-900 font-semibold">KES {order.total_kes.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{order.date}</td>
                  <td className="py-4 px-6 space-x-2">
                    <button className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">View</button>
                    <button className="px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">Confirm</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ components/AdminLayout.js ============
import Link from 'next/link';
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
    { name: 'Products', icon: '📦', href: '/admin/products' },
    { name: 'Orders', icon: '🛒', href: '/admin/orders' },
    { name: 'Customers', icon: '👥', href: '/admin/customers' },
    { name: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { name: 'Inventory', icon: '📋', href: '/admin/inventory' },
    { name: 'Promotions', icon: '🎉', href: '/admin/promotions' },
    { name: 'Reports', icon: '📄', href: '/admin/reports' },
    { name: 'Settings', icon: '⚙️', href: '/admin/settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 overflow-y-auto`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Jamii Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            ☰
          </button>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="text-sm font-semibold">{item.name}</span>}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="bg-white shadow-sm p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-gray-900 font-semibold">Welcome back, Manager</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">👤 Admin User</span>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
              Logout
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
