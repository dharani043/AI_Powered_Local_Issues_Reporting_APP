import React, { useState } from 'react';
import { Camera, MapPin, AlertTriangle, FileText, Save, X } from 'lucide-react';
import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';
import EXIF from 'exif-js';

export function ReportPage() {
  const { addIssue } = useIssues();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    location: '',
    imageUrl: '',
    geoLocation: null
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user) {
    alert('Please login to report an issue');
    return;
  }

  // Validation: Require image
  if (!formData.imageFile) {
    alert('Please upload an image to report the issue');
    return;
  }

  // Validation: Require location data (either from GPS or manual)
  if (!formData.geoLocation && !formData.location) {
    alert('Location data is required. Please upload a geo-tagged image or provide manual location.');
    return;
  }

  // For images without GPS, use manual location
  if (!formData.geoLocation && formData.location) {
    // This is for development - in production, only geo-tagged images should be accepted
    console.warn('Development mode: Using manual location for non-geo-tagged image');
  }

  const formPayload = new FormData();
  formPayload.append('title', formData.title);
  formPayload.append('description', formData.description);
  formPayload.append('category', formData.category);
  formPayload.append('priority', formData.priority);
  formPayload.append('location', formData.location);

  if (formData.imageFile) {
    formPayload.append('image', formData.imageFile);
  }

  if (formData.geoLocation) {
    formPayload.append('geoLocation', JSON.stringify(formData.geoLocation));
  }

  try {
    const res = await fetch('http://localhost:5000/api/issues', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.token}` // if you're using JWT auth
      },
      body: formPayload
    });
// console.log("Submitting with token:", user?.token);

    const data = await res.json();
    if (res.ok) {
      setShowSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        location: '',
        imageUrl: '',
        imageFile: null,
        geoLocation: null
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert(data.error || 'Failed to submit issue');
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Something went wrong. Please try again.');
  }
};


  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            geoLocation: {
              latitude,
              longitude,
              source: 'manual'
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only JPEG or PNG images');
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate image size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      e.target.value = ''; // Clear the input
      return;
    }

    // Extract EXIF GPS data FIRST - reject if no GPS
    EXIF.getData(file, function() {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const lon = EXIF.getTag(this, "GPSLongitude");
      const latRef = EXIF.getTag(this, "GPSLatitudeRef");
      const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

      if (!lat || !lon || !latRef || !lonRef) {
        // For development: Allow images without GPS but require manual location
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            imageUrl: event.target.result,
            imageFile: file,
            geoLocation: null // No GPS data
          }));
        };
        reader.readAsDataURL(file);
        return;
      }

      const latitude = convertDMSToDD(lat, latRef);
      const longitude = convertDMSToDD(lon, lonRef);
      
      // Validate coordinates are reasonable
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        alert('Invalid GPS coordinates found in image');
        e.target.value = ''; // Clear the input
        return;
      }

      // Only if GPS validation passes, load the image
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: event.target.result,
          imageFile: file,
          geoLocation: {
            latitude,
            longitude,
            source: 'exif'
          },
          location: prev.location || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const convertDMSToDD = (dms, ref) => {
    let dd = dms[0] + dms[1]/60 + dms[2]/3600;
    if (ref === "S" || ref === "W") dd = dd * -1;
    return dd;
  };


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to report an issue
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Report New Issue
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Help improve your community by reporting infrastructure issues
            </p>
          </div>
        </div>
        {/* <button onClick={() => localStorage.clear()}>Clear Auth</button> */}

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Save className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="ml-3 text-green-700 dark:text-green-300 font-medium">
                Issue reported successfully! Thank you for helping improve our community.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Title 
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detailed Description 
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Provide detailed information about the issue..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category 
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="pothole">Pothole</option>
                <option value="streetlight">Street Light</option>
                <option value="water_leak">Water Leak</option>
                <option value="trash">Trash/Sanitation</option>
                <option value="sidewalk">Sidewalk</option>
                <option value="other">Other</option>
              </select>
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority Level 
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div> */}
          </div>

          {/* GPS Verification Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              GPS Verification
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Current GPS Status:</p>
                  {formData.geoLocation ? (
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-300 text-sm font-medium">✅ GPS Detected</p>
                      <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                        Lat: {formData.geoLocation.latitude?.toFixed(6)}<br/>
                        Lng: {formData.geoLocation.longitude?.toFixed(6)}<br/>
                        Source: {formData.geoLocation.source === 'exif' ? 'Image EXIF' : 'Browser GPS'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">⚠️ No GPS Data</p>
                      <p className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                        Upload geo-tagged image or use current location
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Test GPS Access:</p>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Get Current Location
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                readOnly={formData.geoLocation?.source === 'exif'}
                className={`flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                  formData.geoLocation?.source === 'exif' ? 'bg-gray-50 dark:bg-gray-600' : ''
                }`}
                placeholder={formData.geoLocation?.source === 'exif' ? 'Location from geo-tagged image' : 'Enter location or use current location'}
              />
              {(!formData.geoLocation || formData.geoLocation.source !== 'exif') && (
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.geoLocation?.source === 'exif' ? (
                <span className="text-green-600 dark:text-green-400">
                  ✓ GPS coordinates from geo-tagged image
                </span>
              ) : (
                'For development: Manual location allowed. Production requires geo-tagged images.'
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Geo-Tagged Photo * (REQUIRED)
            </label>
            <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
              📱 <strong>Best:</strong> Use mobile camera with location services enabled for geo-tagged images<br/>
              💻 <strong>Development:</strong> Laptop users can upload any image + manual location
            </div>
            {formData.geoLocation && formData.geoLocation.source === 'exif' && (
              <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
                ✅ GPS data detected from image - Perfect!
              </div>
            )}
            {formData.imageFile && !formData.geoLocation && (
              <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ No GPS data in image. Please provide manual location below.
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              {formData.imageUrl ? (
                <div className="relative">
                  <img
                    src={formData.imageUrl}
                    alt="Issue"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        Upload a photo
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        capture="environment" 
                        id="photoInput"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 dark:text-gray-400">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    <strong>JPEG/PNG with GPS location data required</strong><br/>
                    Maximum file size: 10MB<br/>
                    <span className="text-red-500">Images without GPS data will be rejected</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Requirements to Submit:</h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-center">
                {formData.imageFile ? '✅' : '❌'} Image uploaded
              </div>
              <div className="flex items-center">
                {(formData.geoLocation || formData.location) ? '✅' : '❌'} Location data provided
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!formData.imageFile || (!formData.geoLocation && !formData.location)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            Submit Issue Report
          </button>
        </form>
      </div>
    </div>
  );
}