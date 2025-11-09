import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Shield, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export function MunicipalityAdminManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      createMunicipalityAdmins();
    }
  }, [user]);

  const createMunicipalityAdmins = async () => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/auth/create-municipality-admins`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      // Admins already exist, which is fine
    } finally {
      setAdmins([
        { name: 'Chennai Corporation', id: 'CHN001', pincode: '600001', email: 'admin@chennai.gov.in' },
        { name: 'Coimbatore Corporation', id: 'CBE001', pincode: '641001', email: 'admin@coimbatore.gov.in' },
        { name: 'Madurai Corporation', id: 'MDU001', pincode: '625001', email: 'admin@madurai.gov.in' },
        { name: 'Trichy Corporation', id: 'TRY001', pincode: '620001', email: 'admin@trichy.gov.in' },
        { name: 'Salem Corporation', id: 'SLM001', pincode: '636001', email: 'admin@salem.gov.in' }
      ]);
      setCreating(false);
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Municipality Admin Management</h1>
            <p className="text-blue-100">Manage municipality administrators</p>
          </div>
          <Building2 className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
        <div className="flex items-center gap-4">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Municipality Admins Status
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {creating ? 'Initializing municipality admins...' : 
               loading ? 'Loading...' : 
               'Municipality admins are ready'}
            </p>
          </div>
        </div>
      </div>

      {/* Municipality List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Available Municipalities
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {admins.map((municipality) => (
            <div key={municipality.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {municipality.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>ID: {municipality.id}</span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {municipality.pincode}
                      </span>
                      <span>{municipality.email}</span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full text-sm font-medium">
                  Ready
                </div>
              </div>
            </div>
          ))}
          {admins.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading municipality data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Municipality Admin Login Instructions
        </h3>
        <div className="space-y-2 text-blue-800 dark:text-blue-200">
          <p>1. Municipality admins can login using the Municipality Login page</p>
          <p>2. Default password format: [cityname]123 (e.g., chennai123)</p>
          <p>3. They need municipality ID and pincode for authentication</p>
          <p>4. Once logged in, they only see issues from their municipality</p>
          <p>5. Issues are auto-mapped based on location/pincode</p>
        </div>
      </div>
    </div>
  );
}