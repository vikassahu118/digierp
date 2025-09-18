import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { TrendingUp, TrendingDown, CreditCard, Activity, Calendar, Filter, IndianRupee } from 'lucide-react';

const FinancialDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Sample data
  const revenueData = [
    { date: 'Jan', revenue: 45000, spending: 32000 },
    { date: 'Feb', revenue: 52000, spending: 28000 },
    { date: 'Mar', revenue: 48000, spending: 35000 },
    { date: 'Apr', revenue: 61000, spending: 42000 },
    { date: 'May', revenue: 55000, spending: 38000 },
    { date: 'Jun', revenue: 67000, spending: 45000 },
    { date: 'Jul', revenue: 72000, spending: 48000 },
  ];

  const dailyData = [
    { day: 'Mon', revenue: 12000, spending: 8000 },
    { day: 'Tue', revenue: 15000, spending: 9000 },
    { day: 'Wed', revenue: 8000, spending: 6000 },
    { day: 'Thu', revenue: 18000, spending: 12000 },
    { day: 'Fri', revenue: 22000, spending: 14000 },
    { day: 'Sat', revenue: 25000, spending: 16000 },
    { day: 'Sun', revenue: 20000, spending: 13000 },
  ];

  const spendingCategories = [
    { name: 'Marketing', value: 35000, color: '#3B82F6' },
    { name: 'Operations', value: 28000, color: '#10B981' },
    { name: 'Technology', value: 18000, color: '#F59E0B' },
    { name: 'Personnel', value: 45000, color: '#EF4444' },
    { name: 'Other', value: 12000, color: '#8B5CF6' },
  ];

  const totalRevenue = 380000;
  const totalSpending = 280000;
  const netProfit = totalRevenue - totalSpending;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);


  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // StatCard component
  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{change}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your revenue and spending performance</p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
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
          <div className="flex items-center text-sm text-gray-500">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Spending Trend</h3>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Performance</h3>
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
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
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
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Generate Report
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            Export Data
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
