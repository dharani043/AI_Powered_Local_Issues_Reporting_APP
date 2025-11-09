import React, { useState, useEffect } from 'react';
import { Building2, MapPin, AlertTriangle, CheckCircle, Clock, Users, BarChart3, Filter, Camera, FileText, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssueContextAPI';
import EXIF from 'exif-js';

export function CorporationDashboard() {
  const { user } = useAuth();
  const { issues, updateIssueStatus } = useIssues();
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusUpdateModal, setStatusUpdateModal] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: '',
    adminNotes: '',
    geotaggedImage: null,
    imagePreview: null,
    gpsVerified: false
  });

  useEffect(() => {
    if (user?.role === 'corporation_admin') {
      // Filter issues by municipality ID for corporation admins
      let corporationIssues = issues.filter(issue => 
        issue.municipalityId === user.municipalityId
      );
      
      // Apply multiple filters
      if (statusFilter !== 'all') {
        corporationIssues = corporationIssues.filter(issue => issue.status === statusFilter);
      }
      if (priorityFilter !== 'all') {
        corporationIssues = corporationIssues.filter(issue => issue.priority === priorityFilter);
      }
      if (categoryFilter !== 'all') {
        corporationIssues = corporationIssues.filter(issue => issue.category === categoryFilter);
      }
      if (locationFilter !== 'all') {
        corporationIssues = corporationIssues.filter(issue => {
          if (locationFilter === 'gps') return issue.geoLocation?.latitude;
          if (locationFilter === 'manual') return !issue.geoLocation?.latitude;
          if (locationFilter === 'nearby') {
            // Filter issues within 5km radius (example)
            return issue.geoLocation?.latitude && 
                   Math.abs(issue.geoLocation.latitude - 11.0) < 0.05 &&
                   Math.abs(issue.geoLocation.longitude - 76.97) < 0.05;
          }
          return true;
        });
      }
      
      setFilteredIssues(corporationIssues);
    } else {
      // Redirect non-corporation admins
      setFilteredIssues([]);
    }
  }, [issues, user, statusFilter, locationFilter, priorityFilter, categoryFilter]);

  const openStatusUpdateModal = (issue) => {
    setStatusUpdateModal(issue);
    setUpdateData({
      status: issue.status === 'pending' ? 'in_progress' : 'resolved',
      adminNotes: '',
      geotaggedImage: null,
      imagePreview: null,
      gpsVerified: false
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPEG or PNG images');
      return;
    }

    // Extract GPS data from image
    EXIF.getData(file, function() {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const lon = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

      const hasGPS = lat && lon && latRef && lonRef;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setUpdateData(prev => ({
          ...prev,
          geotaggedImage: file,
          imagePreview: event.target.result,
          gpsVerified: hasGPS
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleStatusUpdate = async () => {
    if (!updateData.adminNotes.trim()) {
      alert('Admin notes are required');
      return;
    }

    // Development mode: Allow without GPS image for laptop users
    if (!updateData.geotaggedImage) {
      const confirmWithoutImage = window.confirm(
        '💻 Development Mode: No image uploaded.\n\nContinue without geotagged proof?\n\nNote: Production requires geotagged images.'
      );
      if (!confirmWithoutImage) return;
    }

    if (updateData.geotaggedImage && !updateData.gpsVerified) {
      const confirmWithoutGPS = window.confirm(
        '⚠️ Development Mode: Image has no GPS data.\n\nContinue anyway?\n\nNote: Production requires GPS verification.'
      );
      if (!confirmWithoutGPS) return;
    }

    try {
      const formData = new FormData();
      formData.append('status', updateData.status);
      formData.append('adminNotes', updateData.adminNotes);
      if (updateData.geotaggedImage) {
        formData.append('statusImage', updateData.geotaggedImage);
      }
      formData.append('updatedBy', user.name);
      formData.append('municipalityId', user.municipalityId);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/issues/${statusUpdateModal._id}/status-update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Issue status updated successfully!');
        setStatusUpdateModal(null);
        setUpdateData({ status: '', adminNotes: '', geotaggedImage: null, imagePreview: null, gpsVerified: false });
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update issue status');
    }
  };

  const handleAutoAssign = async (issueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/issues/${issueId}/auto-assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Issue auto-assigned to ${result.assignedTo.name} (${result.assignedTo.specialization}) - Distance: ${result.assignedTo.distance}`);
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to auto-assign issue');
      }
    } catch (error) {
      console.error('Auto-assign error:', error);
      alert('Failed to auto-assign issue');
    }
  };

  const stats = {
    total: filteredIssues.length,
    pending: filteredIssues.filter(i => i.status === 'pending').length,
    inProgress: filteredIssues.filter(i => i.status === 'in_progress').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length
  };

  if (user?.role !== 'corporation_admin') {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">Corporation admin access required</p>
      </div>
    );
  }

  if (!user.municipalityId) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Corporation Not Configured</h2>
        <p className="text-gray-600 dark:text-gray-400">Please contact municipality admin to configure your corporation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user.municipalityName} Dashboard</h1>
            <p className="text-blue-100">Corporation ID: {user.municipalityId} | Pincode: {user.pincode}</p>
          </div>
          <Building2 className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="road_maintenance">Road Maintenance</option>
            <option value="water_supply">Water Supply</option>
            <option value="electricity">Electricity</option>
            <option value="waste_management">Waste Management</option>
            <option value="public_safety">Public Safety</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Locations</option>
            <option value="gps">GPS Located</option>
            <option value="manual">Manual Entry</option>
            <option value="nearby">Nearby (5km)</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Corporation Issues</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{issue.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {issue.location}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {issue.reportedBy?.name}
                    </span>
                    <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                    <span className={`capitalize font-medium ${
                      issue.priority === 'high' ? 'text-red-600' :
                      issue.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{issue.priority}</span>
                    {issue.geoLocation?.latitude && (
                      <span className="flex items-center text-blue-600">
                        📍 GPS: {issue.geoLocation.latitude.toFixed(4)}, {issue.geoLocation.longitude.toFixed(4)}
                      </span>
                    )}
                    {issue.pincode && (
                      <span className="text-purple-600">📮 {issue.pincode}</span>
                    )}
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col items-end gap-3">
                  <div className="space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    
                    {issue.status !== 'resolved' && (
                      <div className="space-y-1">
                        <button
                          onClick={() => openStatusUpdateModal(issue)}
                          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Change Status
                        </button>
                        {issue.status === 'pending' && issue.geoLocation && (
                          <button
                            onClick={() => handleAutoAssign(issue._id)}
                            className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                          >
                            Auto-Assign
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {issue.image && (
                    <img
                      src={`http://localhost:5000/${issue.image.replace(/\\\\/g, '/')}`}
                      alt="Issue"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredIssues.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No issues found for your corporation</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Issue Status
                </h3>
                <button
                  onClick={() => setStatusUpdateModal(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Issue Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {statusUpdateModal.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {statusUpdateModal.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {statusUpdateModal.location}
                  </span>
                  <span>Reported by {statusUpdateModal.reportedBy?.name}</span>
                </div>
              </div>

              {/* Status Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status *
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  {statusUpdateModal?.status === 'pending' && (
                    <>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </>
                  )}
                  {statusUpdateModal?.status === 'in_progress' && (
                    <option value="resolved">Resolved</option>
                  )}
                </select>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Admin Notes *
                </label>
                <textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter detailed notes about the action taken, work completed, or resolution details..."
                  required
                />
              </div>

              {/* Geotagged Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Geotagged Proof Image (Development: Optional)
                </label>
                <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    💻 <strong>Development Mode:</strong> GPS image optional for laptop users<br/>
                    📱 <strong>Production:</strong> Will require geotagged images with GPS data
                  </p>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  {updateData.imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={updateData.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {updateData.gpsVerified ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">GPS data verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              <span className="text-sm">No GPS data found</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setUpdateData(prev => ({ ...prev, geotaggedImage: null, imagePreview: null, gpsVerified: false }))}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Upload a geotagged image as proof of work completion
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Image must contain GPS location data (EXIF)
                      </p>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="geotagged-image"
                      />
                      <label
                        htmlFor="geotagged-image"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Development: Optional for laptop users | Production: Required with GPS location
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleStatusUpdate}
                  disabled={!updateData.adminNotes.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Update Status
                </button>
                <button
                  onClick={() => setStatusUpdateModal(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}