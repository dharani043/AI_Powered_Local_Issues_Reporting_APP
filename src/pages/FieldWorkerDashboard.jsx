import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, Clock, CheckCircle, Camera, Upload, X, Settings, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIssues } from '../contexts/IssueContextAPI';

export function FieldWorkerDashboard() {
  const { user } = useAuth();
  const { issues } = useIssues();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    notes: '',
    images: [],
    imagePreview: []
  });

  const [completedIssues, setCompletedIssues] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (user?.role === 'field_worker') {
      const myActiveIssues = issues.filter(issue => 
        issue.fieldWorker === user.id && 
        (issue.status === 'assigned' || issue.status === 'in_progress')
      );
      const myCompletedIssues = issues.filter(issue => 
        issue.fieldWorker === user.id && 
        issue.status === 'resolved'
      );
      setAssignedIssues(myActiveIssues);
      setCompletedIssues(myCompletedIssues);
      
      // Check if location is enabled
      setLocationEnabled(user.locationEnabled || false);
    }
  }, [issues, user]);

  useEffect(() => {
    let watchId;
    if (locationEnabled && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCurrentLocation(location);
          updateLocationOnServer(location);
        },
        (error) => console.error('Location error:', error),
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [locationEnabled]);

  const handleStartWork = async (issueId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/issues/${issueId}/start-work`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'in_progress' })
      });
      
      // Refresh issues
      window.location.reload();
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    
    setResolutionData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreview: [...prev.imagePreview, ...previews]
    }));
  };

  const handleResolveIssue = async () => {
    if (!resolutionData.notes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('status', 'resolved');
      formData.append('resolutionNotes', resolutionData.notes);
      resolutionData.images.forEach(image => {
        formData.append('resolutionImages', image);
      });

      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/issues/${selectedIssue._id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setSelectedIssue(null);
      setResolutionData({ notes: '', images: [], imagePreview: [] });
      window.location.reload();
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/field-workers/change-password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      alert('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const updateLocationOnServer = async (location) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/field-workers/update-location', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const toggleLocationSharing = async () => {
    try {
      const token = localStorage.getItem('token');
      const newEnabled = !locationEnabled;
      
      await fetch('http://localhost:5000/api/field-workers/toggle-location', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: newEnabled })
      });
      
      setLocationEnabled(newEnabled);
      if (!newEnabled) {
        setCurrentLocation(null);
      }
    } catch (error) {
      console.error('Error toggling location:', error);
    }
  };

  if (user?.role !== 'field_worker') {
    return (
      <div className="text-center py-12">
        <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400">Field worker access required</p>
      </div>
    );
  }

  const stats = {
    assigned: assignedIssues.filter(i => i.status === 'assigned').length,
    inProgress: assignedIssues.filter(i => i.status === 'in_progress').length,
    completed: completedIssues.length,
    total: assignedIssues.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Field Worker Dashboard</h1>
            <p className="text-orange-100">Manage your assigned issues</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocationSharing}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                locationEnabled 
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-100' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {locationEnabled ? 'Location ON' : 'Enable Location'}
            </button>
            <button
              onClick={() => setShowPasswordChange(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
            <Wrench className="w-16 h-16 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.assigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCompleted(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !showCompleted 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Active Issues ({stats.total})
              </button>
              <button
                onClick={() => setShowCompleted(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showCompleted 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Completed Work ({stats.completed})
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {!showCompleted ? (
            // Active Issues
            assignedIssues.length > 0 ? assignedIssues.map((issue) => (
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
                      <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      <span className={`capitalize font-medium ${
                        issue.priority === 'high' ? 'text-red-600' :
                        issue.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>{issue.priority}</span>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      issue.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                    }`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                    
                    <div className="flex gap-2">
                      {issue.status === 'assigned' && (
                        <button
                          onClick={() => handleStartWork(issue._id)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Mark Resolved
                        </button>
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
            )) : (
              <div className="p-12 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No active issues assigned to you</p>
              </div>
            )
          ) : (
            // Completed Issues
            completedIssues.length > 0 ? completedIssues.map((issue) => (
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
                      <span className="capitalize">{issue.category.replace('_', ' ')}</span>
                      <span className="text-green-600 font-medium">Completed</span>
                      {issue.resolvedAt && (
                        <span className="text-xs">
                          {new Date(issue.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {issue.adminNotes && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          <strong>Resolution Notes:</strong> {issue.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Resolved
                    </span>
                    
                    <div className="flex gap-2">
                      {issue.image && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Before</p>
                          <img
                            src={`http://localhost:5000/${issue.image.replace(/\\\\/g, '/')}`}
                            alt="Before"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      {issue.rectifiedImage && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">After</p>
                          <img
                            src={`http://localhost:5000/${issue.rectifiedImage.replace(/\\\\/g, '/')}`}
                            alt="After"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No completed work yet</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mark Issue as Resolved
                </h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedIssue.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedIssue.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resolution Notes *
                  </label>
                  <textarea
                    value={resolutionData.notes}
                    onChange={(e) => setResolutionData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the work completed and resolution details..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resolution Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload photos showing the completed work
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="resolution-images"
                      />
                      <label
                        htmlFor="resolution-images"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Images
                      </label>
                    </div>
                    
                    {resolutionData.imagePreview.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {resolutionData.imagePreview.map((preview, index) => (
                          <img
                            key={index}
                            src={preview}
                            alt={`Resolution ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleResolveIssue}
                    disabled={!resolutionData.notes.trim()}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}