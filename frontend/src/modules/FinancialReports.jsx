import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, CreditCard, Activity, Calendar, Filter, IndianRupee, Plus } from 'lucide-react';

// Make sure this URL is correct for your backend
const API_URL = "http://localhost:3000/api/financial";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

const FinancialDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState(null);
  const [entriesData, setEntriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: '', revenue: '', spending: '', category: '' });

  const spendingCategoriesOptions = ['Marketing', 'Operations', 'Technology', 'Personnel', 'Other'];

  const fetchFinancialData = async (range) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication failed. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // Fetch summary data for charts and stats
      const dashboardResponse = await fetch(`${API_URL}?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!dashboardResponse.ok) {
        throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.statusText}`);
      }
      const dashboardJsonData = await dashboardResponse.json();
      setData(dashboardJsonData);

      // Fetch all individual entries for the table
      const entriesResponse = await fetch(`${API_URL}/entries?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!entriesResponse.ok) {
        throw new Error(`Failed to fetch entries data: ${entriesResponse.statusText}`);
      }
      const entriesJsonData = await entriesResponse.json();
      setEntriesData(entriesJsonData);
      
    } catch (err) {
      setError(err.message);
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication failed. Please log in.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newRecord.date,
          revenue: Number(newRecord.revenue),
          spending: Number(newRecord.spending),
          category: newRecord.category
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add record.');
      }

      await fetchFinancialData(timeRange); // refresh both chart data and entries data
      setShowAddModal(false);
      setNewRecord({ date: '', revenue: '', spending: '', category: '' });
    } catch (err) {
      setError(err.message);
      console.error("Error adding record:", err);
    }
  };

  useEffect(() => {
    fetchFinancialData(timeRange);
  }, [timeRange]);

  const formatINR = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center text-gray-600">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mb-4"></div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans flex items-center justify-center text-red-600">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p>{error}</p>
          <button onClick={() => fetchFinancialData(timeRange)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  const { totalRevenue, totalSpending, netProfit, profitMargin, revenueData, dailyData, spendingCategories } = data;

  // StatCard component
  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className=" rounded-xl bg-white/20 backdrop-blur-md shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-300 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-400' : 'text-red-600'}`}>
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen  p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
            <p className="text-gray-300 mt-2">Monitor your revenue and spending performance</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Record
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-300" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatINR(totalRevenue)}
            change="+12.5%"
            changeType="increase"
            icon={IndianRupee}
            color="bg-green-500"
          />
          <StatCard
            title="Total Spending"
            value={formatINR(totalSpending)}
            change="+8.2%"
            changeType="increase"
            icon={CreditCard}
            color="bg-red-500"
          />
          <StatCard
            title="Net Profit"
            value={formatINR(netProfit)}
            change="+18.7%"
            changeType="increase"
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <StatCard
            title="Profit Margin"
            value={`${profitMargin}%`}
            change="+2.3%"
            changeType="increase"
            icon={Activity}
            color="bg-purple-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue vs Spending */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Revenue vs Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={formatINR} />
                <Tooltip
                  formatter={(value) => formatINR(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Revenue" />
                <Line type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} name="Spending" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Performance */}
          <div className="bg-white/20 backdrop-blur-mdrounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Daily Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={formatINR} />
                <Tooltip formatter={(value) => formatINR(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="spending" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Spending" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Categories */}
          <div className="lg:col-span-1 bg-white/20 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={spendingCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {spendingCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatINR(value), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Comparison */}
          <div className="lg:col-span-2 bg-white/20 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Monthly Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={formatINR} />
                <Tooltip formatter={(value) => formatINR(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="spending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Entries Table now uses entriesData */}
        <div className="mt-8 bg-white/20 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Daily Financial Entries ({timeRange})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className='rounded-2xl'>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody className="bg-white backdrop-blur-md divide-y divide-gray-200">
                {entriesData.length > 0 ? (
                  entriesData.map((entry, index) => (
                    <tr key={index} className="">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                        {formatINR(entry.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatINR(entry.spending)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.category || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-300">
                      No entries found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal stays unchanged */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Financial Record">
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label htmlFor="record-date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="record-date"
              value={newRecord.date}
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="record-revenue" className="block text-sm font-medium text-gray-700">Revenue (INR)</label>
            <input
              type="number"
              id="record-revenue"
              value={newRecord.revenue}
              onChange={(e) => setNewRecord({ ...newRecord, revenue: e.target.value })}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="record-spending" className="block text-sm font-medium text-gray-700">Spending (INR)</label>
            <input
              type="number"
              id="record-spending"
              value={newRecord.spending}
              onChange={(e) => setNewRecord({ ...newRecord, spending: e.target.value })}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="record-category" className="block text-sm font-medium text-gray-700">Spending Category</label>
            <select
              id="record-category"
              value={newRecord.category}
              onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {spendingCategoriesOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancialDashboard;
