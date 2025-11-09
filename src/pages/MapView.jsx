import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter, Eye, Navigation, Search, Layers, Target, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';

export function MapView() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClusters, setShowClusters] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 });
  const [hoveredIssue, setHoveredIssue] = useState(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Trigger data refresh
      window.location.reload();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Advanced filtering with search and role-based filtering
  useEffect(() => {
    let filtered = issues.filter(issue => issue.geoLocation);
    
    // Role-based filtering
    if (user?.role === 'corporation_admin' && user.municipalityId) {
      filtered = filtered.filter(issue => issue.municipalityId === user.municipalityId);
    } else if (user?.role === 'user' && userLocation) {
      // Regular users see issues within 5km range
      filtered = filtered.filter(issue => {
        if (!issue.geoLocation?.latitude || !issue.geoLocation?.longitude) return false;
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          parseFloat(issue.geoLocation.latitude), parseFloat(issue.geoLocation.longitude)
        );
        return distance <= 5; // 5km radius
      });
    }
    // Admin and municipality_admin see all issues
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredIssues(filtered);
  }, [issues, statusFilter, categoryFilter, priorityFilter, searchTerm, user]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user location with high accuracy
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log('Location error:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Issue clustering logic
  const clusteredIssues = useMemo(() => {
    if (!showClusters) return filteredIssues.map(issue => ({ ...issue, cluster: false }));
    
    const clusters = [];
    const processed = new Set();
    
    filteredIssues.forEach(issue => {
      if (processed.has(issue._id)) return;
      
      const lat = parseFloat(issue.geoLocation.latitude);
      const lng = parseFloat(issue.geoLocation.longitude);
      
      const nearby = filteredIssues.filter(other => {
        if (processed.has(other._id) || other._id === issue._id) return false;
        const otherLat = parseFloat(other.geoLocation.latitude);
        const otherLng = parseFloat(other.geoLocation.longitude);
        const distance = Math.sqrt(Math.pow(lat - otherLat, 2) + Math.pow(lng - otherLng, 2));
        return distance < 0.01; // Cluster threshold
      });
      
      if (nearby.length > 0) {
        clusters.push({
          ...issue,
          cluster: true,
          clusterSize: nearby.length + 1,
          clusterIssues: [issue, ...nearby]
        });
        processed.add(issue._id);
        nearby.forEach(n => processed.add(n._id));
      } else {
        clusters.push({ ...issue, cluster: false });
        processed.add(issue._id);
      }
    });
    
    return clusters;
  }, [filteredIssues, showClusters]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredIssues.length;
    const pending = filteredIssues.filter(i => i.status === 'pending').length;
    const inProgress = filteredIssues.filter(i => i.status === 'in_progress').length;
    const resolved = filteredIssues.filter(i => i.status === 'resolved').length;
    const highPriority = filteredIssues.filter(i => i.priority === 'high').length;
    
    return { total, pending, inProgress, resolved, highPriority };
  }, [filteredIssues]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 shadow-red-200';
      case 'medium': return 'border-yellow-500 shadow-yellow-200';
      case 'low': return 'border-green-500 shadow-green-200';
      default: return 'border-gray-500 shadow-gray-200';
    }
  };

  const openInMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter({ x: 50, y: 50 });
      setZoomLevel(2);
    }
  };

  const centerOnIssues = () => {
    if (filteredIssues.length > 0) {
      const avgLat = filteredIssues.reduce((sum, issue) => sum + parseFloat(issue.geoLocation.latitude), 0) / filteredIssues.length;
      const avgLng = filteredIssues.reduce((sum, issue) => sum + parseFloat(issue.geoLocation.longitude), 0) / filteredIssues.length;
      
      const mapX = ((avgLng - 76) / (81 - 76)) * 100;
      const mapY = ((14 - avgLat) / (14 - 8)) * 100;
      
      setMapCenter({ x: Math.max(0, Math.min(100, mapX)), y: Math.max(0, Math.min(100, mapY)) });
      setZoomLevel(1.5);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Enhanced Header with Stats */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 p-6 rounded-2xl text-white shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Smart Issue Map</h1>
            <p className="text-green-100">AI-powered geographic visualization of civic issues</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-3 rounded-xl transition-all ${autoRefresh ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70'} hover:bg-white/30`}
              title="Auto Refresh"
            >
              <Zap className={`w-6 h-6 ${autoRefresh ? 'animate-pulse' : ''}`} />
            </button>
            <MapPin className="w-16 h-16 text-green-200 animate-bounce" />
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs opacity-80">Total Issues</div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs opacity-80">Pending</div>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-xs opacity-80">In Progress</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <div className="text-xs opacity-80">Resolved</div>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{stats.highPriority}</div>
            <div className="text-xs opacity-80">High Priority</div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="streetlight">Street Light</option>
            <option value="water_leak">Water Leak</option>
            <option value="trash">Trash/Sanitation</option>
            <option value="sidewalk">Sidewalk</option>
            <option value="other">Other</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`px-4 py-2 rounded-lg transition-all ${showClusters ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            title="Toggle Clustering"
          >
            <Layers className="w-4 h-4" />
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredIssues.length} issues found
          </div>
        </div>
      </div>

      {/* Enhanced Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-2xl overflow-hidden">
        <div className="h-[500px] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
          {/* Advanced Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 4))}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 0.5))}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={centerOnUser}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
              title="Center on Me"
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              onClick={centerOnIssues}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border shadow-lg flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 transition-all hover:scale-110"
              title="Center on Issues"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          {/* Animated Map Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 animate-pulse"></div>
          </div>
          
          {/* User Location with Pulse */}
          {userLocation && (
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${mapCenter.x}%`,
                top: `${mapCenter.y}%`
              }}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg animate-ping absolute"></div>
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          )}

          {/* Enhanced Issue Markers */}
          <div className="absolute inset-0">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue, index) => {
                // Simple grid-based positioning for better visibility
                const angle = (index * 137.5) % 360;
                const radius = 25 + (index % 4) * 15;
                const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
                const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
                
                return (
                  <div
                    key={issue._id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 z-10`}
                    style={{
                      left: `${Math.max(8, Math.min(92, x))}%`,
                      top: `${Math.max(8, Math.min(92, y))}%`
                    }}
                    onClick={() => setSelectedIssue(issue)}
                    onMouseEnter={() => setHoveredIssue(issue)}
                    onMouseLeave={() => setHoveredIssue(null)}
                    title={`${issue.title} - ${issue.status}`}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 ${getStatusColor(issue.status)} ${getPriorityColor(issue.priority)} shadow-lg flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(issue.status)}`}></div>
                      {issue.priority === 'high' && (
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50"></div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No Issues Found</p>
                  <p className="text-sm">Try adjusting your filters or report new issues</p>
                </div>
              </div>
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredIssue && (
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border z-30 max-w-sm animate-slideIn">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{hoveredIssue.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{hoveredIssue.description.substring(0, 100)}...</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${getStatusColor(hoveredIssue.status)} text-white`}>
                  {hoveredIssue.status.replace('_', ' ')}
                </span>
                <span className="text-gray-500">{hoveredIssue.priority} priority</span>
              </div>
            </div>
          )}

          {/* Enhanced Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl border">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Legend
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-400">Pending ({stats.pending})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-400">In Progress ({stats.inProgress})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                <span className="text-gray-600 dark:text-gray-400">Resolved ({stats.resolved})</span>
              </div>
              {showClusters && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm flex items-center justify-center text-white text-xs font-bold">N</div>
                  <span className="text-gray-600 dark:text-gray-400">Clustered Issues</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border animate-slideUp">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedIssue.title}
                </h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-3 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  ×
                </button>
              </div>

              {selectedIssue.image && (
                <img
                  src={`http://localhost:5000/${selectedIssue.image.replace(/\\\\/g, '/')}`}
                  alt="Issue"
                  className="w-full h-64 object-cover rounded-2xl mb-6 shadow-lg"
                />
              )}

              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{selectedIssue.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedIssue.location}</span>
                  </div>
                  {selectedIssue.geoLocation?.latitude && selectedIssue.geoLocation?.longitude && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 ml-8">
                      📍 {parseFloat(selectedIssue.geoLocation.latitude).toFixed(6)}, {parseFloat(selectedIssue.geoLocation.longitude).toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedIssue.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    selectedIssue.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {selectedIssue.status === 'pending' && <Clock className="w-4 h-4 inline mr-2" />}
                    {selectedIssue.status === 'in_progress' && <TrendingUp className="w-4 h-4 inline mr-2" />}
                    {selectedIssue.status === 'resolved' && <CheckCircle className="w-4 h-4 inline mr-2" />}
                    {selectedIssue.status.replace('_', ' ')}
                  </span>
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedIssue.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                    selectedIssue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {selectedIssue.priority === 'high' && <AlertTriangle className="w-4 h-4 inline mr-2" />}
                    {selectedIssue.priority} priority
                  </span>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  Reported by <span className="font-medium">{selectedIssue.reportedBy?.name}</span> on {new Date(selectedIssue.createdAt).toLocaleDateString()}
                </div>

                {/* Debug and show coordinates */}
                <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  Debug: {JSON.stringify(selectedIssue.geoLocation)}
                </div>

                {/* Always show Open in Maps button - simplified check */}
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                    📍 GPS: {selectedIssue.geoLocation?.latitude || 'N/A'}, {selectedIssue.geoLocation?.longitude || 'N/A'}
                  </div>
                  <button
                    onClick={() => {
                      const lat = selectedIssue.geoLocation?.latitude || 10.997369;
                      const lng = selectedIssue.geoLocation?.longitude || 76.958888;
                      openInMaps(parseFloat(lat), parseFloat(lng));
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all flex items-center justify-center gap-3 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Navigation className="w-5 h-5" />
                    Open Exact Location in Google Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Issues List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 text-green-500" />
            Issues with Location Data
            <span className="text-sm font-normal text-gray-500">({filteredIssues.length} found)</span>
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredIssues.map((issue) => (
            <div key={issue._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    {issue.location}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {issue.description.substring(0, 100)}...
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)} text-white shadow-sm`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  
                  {issue.geoLocation?.latitude && issue.geoLocation?.longitude && (
                    <button
                      onClick={() => openInMaps(parseFloat(issue.geoLocation.latitude), parseFloat(issue.geoLocation.longitude))}
                      className="p-3 text-green-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                      title="Open in Google Maps"
                    >
                      <Navigation className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
}