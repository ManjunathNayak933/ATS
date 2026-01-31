import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    avgMatchScore: 0,
    topJobs: [],
    applicationsOverTime: [],
    statusDistribution: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Colors for charts
  const COLORS = {
    pending: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444'
  };

  const pieData = [
    { name: 'Pending', value: dashboardData.statusDistribution.pending || 0, color: COLORS.pending },
    { name: 'Approved', value: dashboardData.statusDistribution.approved || 0, color: COLORS.approved },
    { name: 'Rejected', value: dashboardData.statusDistribution.rejected || 0, color: COLORS.rejected }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Jobs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.totalJobs}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.activeJobs}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Candidates */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.totalCandidates}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Match Score */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.avgMatchScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Applications Over Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Applications Over Time
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Candidate Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Jobs by Applications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Jobs by Applications
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topJobs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis 
                type="category" 
                dataKey="title" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                width={150}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="applications" 
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
                name="Applications"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
