import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, User, Vote, CheckCircle, Clock, AlertCircle, ImageIcon, X, Navigation } from 'lucide-react';
import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';

const categoryColors = {
  pothole: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  streetlight: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  water_leak: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  trash: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  sidewalk: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
};

const statusIcons = {
  pending: AlertCircle,
  in_progress: Clock,
  resolved: CheckCircle
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
};

export function HomePage() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('unknown');
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [userMunicipality, setUserMunicipality] = useState(null);

  useEffect(() => {
    // Check if user has stored location from previous issue reports
    const storedLocation = localStorage.getItem(`userLocation_${user?.id}`);
    const storedMunicipality = localStorage.getItem(`userMunicipality_${user?.id}`);
    
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
      setLocationPermission('granted');
    }
    
    if (storedMunicipality) {
      setUserMunicipality(JSON.parse(storedMunicipality));
      setLocationFilter('my_area'); // Auto-show municipality issues
    }
  }, [user]);

  useEffect(() => {
    if (userLocation && locationFilter === 'nearby') {
      const nearby = issues.filter(issue => {
        if (!issue.geoLocation?.latitude) return false;
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          issue.geoLocation.latitude, issue.geoLocation.longitude
        );
        return distance <= 5; // 5km radius
      });
      setNearbyIssues(nearby);
    }
  }, [userLocation, issues, locationFilter]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const detectMunicipalityFromLocation = async (latitude, longitude) => {
    try {
      const axios = require('axios');
      const LOCATIONIQ_KEY = 'pk.f526e213a60e771ab60012038dea1247';
      const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`;
      
      const response = await fetch(url);
      const data = await response.json();
      const address = data.address;
      const detectedPincode = address.postcode;
      const city = address.city || address.town || address.village || '';
      
      // Municipality mapping
      const municipalityMap = {
        '600': { id: 'CHN001', name: 'Chennai Corporation' },
        '641': { id: 'CBE001', name: 'Coimbatore Corporation' },
        '625': { id: 'MDU001', name: 'Madurai Corporation' },
        '620': { id: 'TRY001', name: 'Trichy Corporation' },
        '636': { id: 'SLM001', name: 'Salem Corporation' }
      };
      
      // Check pincode mapping
      for (const [prefix, mun] of Object.entries(municipalityMap)) {
        if (detectedPincode?.startsWith(prefix)) {
          return { municipalityId: mun.id, municipalityName: mun.name };
        }
      }
      
      // Check city name mapping
      const cityMap = {
        'chennai': 'CHN001', 'coimbatore': 'CBE001', 'madurai': 'MDU001', 
        'trichy': 'TRY001', 'tiruchirappalli': 'TRY001', 'salem': 'SLM001'
      };
      
      for (const [cityName, munId] of Object.entries(cityMap)) {
        if (city.toLowerCase().includes(cityName)) {
          const mun = Object.values(municipalityMap).find(m => m.id === munId);
          return { municipalityId: munId, municipalityName: mun?.name };
        }
      }
      
      // Default to Coimbatore
      return { municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' };
    } catch (error) {
      console.error('Municipality detection error:', error);
      return { municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' };
    }
  };

  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          setUserLocation(location);
          setLocationPermission('granted');
          
          // Detect municipality and auto-filter
          const municipality = await detectMunicipalityFromLocation(location.latitude, location.longitude);
          if (municipality.municipalityId) {
            setLocationFilter('my_area');
            // Store detected municipality for user
            localStorage.setItem(`userMunicipality_${user.id}`, JSON.stringify(municipality));
          }
          
          // Store user location locally
          localStorage.setItem(`userLocation_${user.id}`, JSON.stringify(location));
          
          // Save location to server
          try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/user/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude
              })
            });
          } catch (error) {
            console.error('Failed to save location to server:', error);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationPermission('denied');
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    let matchesLocation = true;
    if (locationFilter === 'nearby' && userLocation) {
      matchesLocation = nearbyIssues.some(nearby => nearby._id === issue._id);
    } else if (locationFilter === 'my_area') {
      // Check user's detected municipality or assigned municipality
      const municipalityId = userMunicipality?.municipalityId || user?.municipalityId;
      matchesLocation = issue.municipalityId === municipalityId;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesLocation;
  });

  const userResolvedIssues = user ? issues.filter(issue => 
    issue.reportedBy === user.id && issue.status === 'resolved'
  ) : [];


  return (
    <div className="space-y-6">
      
      {/* Location Access Section - Only for regular users */}
      {user && user.role === 'user' && locationPermission !== 'denied' && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Location-Based Issues</h2>
              <p className="text-blue-100">
                {userLocation ? 
                  `${userMunicipality ? `Showing ${userMunicipality.municipalityName} issues` : `Location: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}` :
                  'Enable location to see issues from your municipality'
                }
              </p>
            </div>
            {!userLocation && (
              <button
                onClick={requestLocation}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Enable Location
              </button>
            )}
            {userLocation && (
              <div className="text-right">
                <p className="text-sm text-blue-200">Location Enabled ✓</p>
                <button
                  onClick={requestLocation}
                  className="text-xs text-blue-200 hover:text-white underline"
                >
                  Update Location
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              {/* <span>{user.name} hoadon</span> */}
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{issues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {issues.filter(i => i.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {issues.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {issues.filter(i => i.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User's Rectified Issues Section */}
      {user && userResolvedIssues.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Your Resolved Issues
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userResolvedIssues.map(issue => (
              <div key={issue.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{issue.title}</h4>
                <div className="flex space-x-2 mb-3">
                  {issue.imageUrl && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Before</p>
                      <img src={issue.imageUrl.startsWith('http')
                        ? issue.imageUrl
                        : `http://localhost:5000/uploads/${issue.imageUrl}`
                      } 
                        alt="Before" className="w-full h-20 object-cover rounded" />
                    </div>
                  )}
                  {issue.rectifiedImage && (
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">After</p>
                      <img src={issue.rectifiedImage.startsWith('http')
                        ? issue.rectifiedImage
                        : `http://localhost:5000/${issue.rectifiedImage}`
                      } alt="After" className="w-full h-20 object-cover rounded" />
                    </div>
                  )}
                </div>
                {issue.adminNotes && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {issue.adminNotes}
                  </p>
                )}
                <div className="text-xs mt-2">
                  <span className="text-green-600 dark:text-green-400">
                    Resolved {new Date(issue.createdAt).toLocaleString()}
                  </span>
                  {issue.resolvedBy && (
                    <span className="text-gray-500"> by {issue.resolvedBy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="streetlight">Street Light</option>
              <option value="water_leak">Water Leak</option>
              <option value="trash">Trash</option>
              <option value="sidewalk">Sidewalk</option>
              <option value="other">Other</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {userLocation && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Locations</option>
                <option value="nearby">Nearby (5km)</option>
                {(userMunicipality || user?.municipalityId) && <option value="my_area">My Municipality</option>}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredIssues.map((issue) => {
    const StatusIcon = statusIcons[issue.status] || AlertCircle;
    return (
      <div
        key={issue._id}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setSelectedIssue(issue)}
      >

        {issue.image && (
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
            <img
              src={issue.image.startsWith('data:') ? issue.image : `http://localhost:5000/${issue.image}`}
              alt="Issue"
              className="w-full h-full object-cover"
            />
            {/* {console.log('First image:', issue.image)} */}
            <div className="absolute top-3 right-3 flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {issue.title}
            </h3>
            <StatusIcon className={`w-5 h-5 ml-2 flex-shrink-0 ${
              issue.status === 'resolved' ? 'text-green-500' :
              issue.status === 'in_progress' ? 'text-blue-500' : 'text-yellow-500'
            }`} />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {issue.description}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">{issue.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <User className="w-4 h-4 mr-1" />
              <span>{issue.reportedBy?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[issue.category]}`}>
                {issue.category.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Vote className="w-4 h-4 mr-1" />
              <span>{issue.votes}</span>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>


      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Issue Details
                </h2>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedIssue.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedIssue.description}
                  </p>
                </div>

                {(selectedIssue.imageUrl || selectedIssue.rectifiedImage) && (
                  <div className="space-y-4">
                    {selectedIssue.imageUrl && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Reported Image
                      </h4>
                      <img
                        src={selectedIssue.imageUrl.startsWith('http')
                          ? selectedIssue.imageUrl
                          : `http://localhost:5000/uploads/${selectedIssue.imageUrl}`}
                        alt="Issue"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    )}

                    {selectedIssue.inProgressImageUrl && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-500" />
                          In Progress Image
                        </h4>
                        <img
                          src={selectedIssue.inProgressImageUrl}
                          alt="In Progress"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {selectedIssue.rectifiedImage && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Resolved Image
                        </h4>
                        <img
                          src={selectedIssue.rectifiedImage.startsWith('http')
                            ? selectedIssue.rectifiedImage
                            : `http://localhost:5000/${selectedIssue.rectifiedImage}`}
                          alt="Resolved"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
                

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reported By</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.reportedBy?.name || 'Unknown'}</p>
                    {console.log("Reported By:", selectedIssue.reportedBy?.name || 'Unknown')}
                    {console.log("Image URL:", selectedIssue.image)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Date Reported</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedIssue.updatedAt).toLocaleDateString()}
                      {console.log(selectedIssue.At)}
                    </p>
                  </div>
                  {selectedIssue.resolvedAt && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Date Resolved</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedIssue.category]}`}>
                    {selectedIssue.category.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedIssue.status]}`}>
                    {selectedIssue.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[selectedIssue.priority]}`}>
                    {selectedIssue.priority} priority
                  </span>
                </div>

                {selectedIssue.adminNotes && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Resolution Notes
                    </h4>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      {selectedIssue.adminNotes}
                    </p>
                    {selectedIssue.resolvedBy && (
                      <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                        - {selectedIssue.resolvedBy}
                      </p>
                    )}
                  </div>
                )}

                {selectedIssue.userFeedback && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      User Feedback
                    </h4>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">
                        {'★'.repeat(selectedIssue.userFeedback.rating)}
                        {'☆'.repeat(5 - selectedIssue.userFeedback.rating)}
                      </span>
                      <span className="ml-2 text-sm text-blue-700 dark:text-blue-300">
                        ({selectedIssue.userFeedback.rating}/5)
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      {selectedIssue.userFeedback.comment}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                      Submitted on {new Date(selectedIssue.userFeedback.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default HomePage;
