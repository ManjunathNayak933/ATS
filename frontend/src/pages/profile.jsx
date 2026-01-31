import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddHR, setShowAddHR] = useState(false);
  
  const [company, setCompany] = useState({
    name: '',
    email: '',
    logoUrl: ''
  });
  
  const [hrTeam, setHrTeam] = useState([]);
  
  const [newHR, setNewHR] = useState({
    name: '',
    email: '',
    password: '',
    role: 'HR'
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch company info
      const companyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/company`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const companyData = await companyResponse.json();
      setCompany(companyData);

      // Fetch HR team
      const teamResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const teamData = await teamResponse.json();
      setHrTeam(teamData.team || []);
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/company`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(company)
      });

      if (!response.ok) throw new Error('Failed to update company');

      alert('Company information updated successfully!');
    } catch (error) {
      alert('Failed to update company information');
      console.error('Error updating company:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHR = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newHR)
      });

      if (!response.ok) throw new Error('Failed to add HR member');

      const addedHR = await response.json();
      setHrTeam([...hrTeam, addedHR.user]);
      setNewHR({ name: '', email: '', password: '', role: 'HR' });
      setShowAddHR(false);
      alert('HR member added successfully!');
    } catch (error) {
      alert('Failed to add HR member. Email might already exist.');
      console.error('Error adding HR:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHR = async (hrId) => {
    if (!confirm('Are you sure you want to remove this HR member?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/team/${hrId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to remove HR member');

      setHrTeam(hrTeam.filter(hr => hr.id !== hrId));
      alert('HR member removed successfully');
    } catch (error) {
      alert('Failed to remove HR member');
      console.error('Error removing HR:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your company information and HR team
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Company Information
            </h2>
            
            <form onSubmit={handleCompanyUpdate} className="space-y-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Email
                </label>
                <input
                  id="company-email"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="company-logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL (optional)
                </label>
                <input
                  id="company-logo"
                  type="url"
                  value={company.logoUrl || ''}
                  onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {company.logoUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                  <img 
                    src={company.logoUrl} 
                    alt="Company logo" 
                    className="h-20 w-auto border border-gray-200 rounded"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* HR Team */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                HR Team ({hrTeam.length})
              </h2>
              <button
                onClick={() => setShowAddHR(!showAddHR)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors"
              >
                {showAddHR ? 'Cancel' : '+ Add HR'}
              </button>
            </div>

            {/* Add HR Form */}
            {showAddHR && (
              <form onSubmit={handleAddHR} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newHR.name}
                    onChange={(e) => setNewHR({ ...newHR, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newHR.email}
                    onChange={(e) => setNewHR({ ...newHR, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password (min. 8 characters)"
                    value={newHR.password}
                    onChange={(e) => setNewHR({ ...newHR, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength="8"
                  />
                </div>
                <div>
                  <select
                    value={newHR.role}
                    onChange={(e) => setNewHR({ ...newHR, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="HR">HR</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Adding...' : 'Add HR Member'}
                </button>
              </form>
            )}

            {/* HR Team List */}
            <div className="space-y-3">
              {hrTeam.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No HR members yet. Add your first team member!
                </p>
              ) : (
                hrTeam.map((hr) => (
                  <div
                    key={hr.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {hr.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{hr.name}</p>
                        <p className="text-sm text-gray-600">{hr.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        hr.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {hr.role}
                      </span>
                      {user?.role === 'ADMIN' && hr.id !== user.id && (
                        <button
                          onClick={() => handleRemoveHR(hr.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove HR member"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
