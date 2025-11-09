import React, { useState } from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2, AlertTriangle,
  Calendar, MapPin, User, X, ImageIcon, MessageSquare, Star, Send
} from 'lucide-react';

import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';
import AIInsights from '../components/AIInsights';

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

export function UserDashboard() {
  const { issues, deleteIssue, getUserIssues, addUserFeedback } = useIssues();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [selectedResolvedIssue, setSelectedResolvedIssue] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view your issues
          </p>
        </div>
      </div>
    );
  }

  const userIssues = getUserIssues(user.id);
  const filteredIssues = statusFilter === 'all' 
    ? userIssues 
    : userIssues.filter(issue => issue.status === statusFilter);

  const pendingCount = userIssues.filter(i => i.status === 'pending').length;
  const inProgressCount = userIssues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = userIssues.filter(i => i.status === 'resolved').length;

  const handleDeleteIssue = (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      deleteIssue(issueId);
    }
  };

  const handleFeedbackSubmit = () => {
    if (selectedIssue && feedback.comment.trim()) {
      const feedbackData = {
        rating: feedback.rating,
        comment: feedback.comment.trim(),
        submittedAt: new Date().toISOString()
      };
      
      const issueId = selectedIssue._id || selectedIssue.id;
      addUserFeedback(issueId, feedbackData);
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '' });
      setShowSuccessMessage(true);
      
      // Update both selected issues to reflect the new feedback
      setSelectedIssue(prev => ({
        ...prev,
        userFeedback: feedbackData
      }));
      
      if (selectedResolvedIssue && (selectedResolvedIssue._id === issueId || selectedResolvedIssue.id === issueId)) {
        setSelectedResolvedIssue(prev => ({
          ...prev,
          userFeedback: feedbackData
        }));
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Issues Dashboard</h1>
            <p className="text-blue-100">Track and manage your reported issues</p>
          </div>
          <FileText className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{userIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingCount}</p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressCount}</p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resolved Issues Showcase */}
      {resolvedCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              Your Resolved Issues - Community Impact
            </h3>
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {resolvedCount} Issues Resolved
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userIssues.filter(issue => issue.status === 'resolved').map(issue => (
              <div 
                key={issue._id || issue.id} 
                onClick={() => {
                  setSelectedResolvedIssue(issue);
                  setShowResolvedModal(true);
                }}
                className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {issue.title}
                    </h4>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex space-x-3 mb-4">
                    {issue.image && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Before</p>
                        <img 
                          src={issue.image.startsWith('http') ? issue.image : `http://localhost:5000/${issue.image}`} 
                          alt="Before" 
                          className="w-full h-20 object-cover rounded border" 
                        />
                      </div>
                    )}
                    {issue.rectifiedImage && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">After</p>
                        <img 
                          src={`http://localhost:5000/${issue.rectifiedImage.replace(/\\/g, '/')}`} 
                          alt="After" 
                          className="w-full h-20 object-cover rounded border" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        Resolved {new Date(issue.updatedAt).toLocaleDateString()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        by {issue.reportedBy?.name || 'You'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Issues List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Reported Issues</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {statusFilter === 'all' ? 'No issues reported yet' : `No ${statusFilter.replace('_', ' ')} issues`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {statusFilter === 'all' ? 'Start by reporting your first issue!' : 'Try changing the filter to see other issues.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => {
                // key= issue.id || issue._id; // Use id or _id based on your data structure
                const StatusIcon = statusIcons[issue.status]|| AlertTriangle;
                
                return (
                  <div
                    key={issue._id || issue.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {issue.title}
                          </h3>
                          <StatusIcon className={`w-5 h-5 ${
                            issue.status === 'resolved' ? 'text-green-500' :
                            issue.status === 'in_progress' ? 'text-blue-500' : 'text-yellow-500'
                          }`} />
                        </div>
                        <img 
                          src={issue.image.startsWith('http')
                            ? issue.image
                            : `http://localhost:5000/${issue.image}`
                          }
                          alt="Issue"
                          className="w-100 h-40 object-cover rounded-lg mb-4"
                        />
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {issue.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{issue.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            {/* {console.log('Issue created at:', issue.createdAt)}; // Debugging line */}

                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                            {issue.priority} priority
                          </span>
                        </div>
                        
                        <AIInsights issue={issue} />
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {issue.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteIssue(issue._id || issue.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Issue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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

                {(selectedIssue.image || selectedIssue.rectifiedImage) && (
                  <div className="space-y-4">
                    {selectedIssue.imageUrl && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Reported Image
                        </h4>
                        <img
                          src={selectedIssue.image.startsWith('http')
                          ? selectedIssue.image
                          : `http://localhost:5000/uploads/${selectedIssue.image}`
                          }
                          alt="Issue"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {selectedIssue.rectifiedImage && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Rectified Image
                        </h4>
                        <img
                          src={`http://localhost:5000/${selectedIssue.rectifiedImage.replace(/\\/g, '/')}`}
                          alt="Rectified"
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
                    <img
                          src={selectedIssue.image.startsWith('http')
                          ? selectedIssue.image
                          : `http://localhost:5000/${selectedIssue.image}`
                          }
                          alt="Issue"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Date Reported</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedIssue.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
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
                        Resolved by: {selectedIssue.resolvedBy} on {new Date(selectedIssue.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {selectedIssue.status === 'resolved' && !selectedIssue.userFeedback && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Share Your Feedback
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                      How satisfied are you with the resolution of this issue?
                    </p>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      {/* <Star className="w-4 h-4 mr-2" /> */}
                      Give Feedback & Rating
                    </button>
                  </div>
                )}

                {selectedIssue.userFeedback && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Your Feedback
                    </h4>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">
                        {'★'.repeat(selectedIssue.userFeedback.rating)}
                        {'☆'.repeat(5 - selectedIssue.userFeedback.rating)}
                      </span>
                      <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                        ({selectedIssue.userFeedback.rating}/5)
                      </span>
                    </div>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      {selectedIssue.userFeedback.comment}
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                      Submitted on {new Date(selectedIssue.userFeedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Issue Detail Modal */}
      {showResolvedModal && selectedResolvedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-green-500 p-6 rounded-t-xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Issue Resolved</h2>
                    <p className="text-green-100">Community Impact</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowResolvedModal(false);
                    setSelectedResolvedIssue(null);
                  }}
                  className="hover:bg-green-600 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Issue Title & Description */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedResolvedIssue.title}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedResolvedIssue.description}
                  </p>
                </div>
              </div>

              {/* Before & After Images */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Before Image */}
                {selectedResolvedIssue.image && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                      Before - Issue Reported
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={selectedResolvedIssue.image.startsWith('http') ? selectedResolvedIssue.image : `http://localhost:5000/${selectedResolvedIssue.image}`}
                        alt="Before"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* After Image */}
                {selectedResolvedIssue.rectifiedImage && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      After - Issue Resolved
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000/${selectedResolvedIssue.rectifiedImage.replace(/\\/g, '/')}`}
                        alt="After"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline & Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline & Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Reporting Details */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Reported By
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Reporter:</strong> {selectedResolvedIssue.reportedBy?.name || 'You'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Date:</strong> {new Date(selectedResolvedIssue.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Location:</strong> {selectedResolvedIssue.location}
                    </p>
                  </div>

                  {/* Resolution Details */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Resolved By
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Resolver:</strong> {selectedResolvedIssue.resolvedBy || 'Municipality Admin'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Date:</strong> {new Date(selectedResolvedIssue.updatedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Resolution Time:</strong> {Math.ceil((new Date(selectedResolvedIssue.updatedAt) - new Date(selectedResolvedIssue.createdAt)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Description */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Original Description
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedResolvedIssue.description}
                  </p>
                </div>

                {/* Admin Resolution Notes */}
                {selectedResolvedIssue.adminNotes && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Resolution Notes
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedResolvedIssue.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              {selectedResolvedIssue.status === 'resolved' && !selectedResolvedIssue.userFeedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Share Your Feedback
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                    How satisfied are you with the resolution of this issue?
                  </p>
                  <button
                    onClick={() => {
                      setSelectedIssue(selectedResolvedIssue);
                      setShowFeedbackModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Give Feedback & Rating
                  </button>
                </div>
              )}

              {selectedResolvedIssue.userFeedback && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    Your Feedback
                  </h4>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">
                      {'★'.repeat(selectedResolvedIssue.userFeedback.rating)}
                      {'☆'.repeat(5 - selectedResolvedIssue.userFeedback.rating)}
                    </span>
                    <span className="ml-2 text-sm text-green-700 dark:text-green-300">
                      ({selectedResolvedIssue.userFeedback.rating}/5)
                    </span>
                  </div>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    {selectedResolvedIssue.userFeedback.comment}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                    Submitted on {new Date(selectedResolvedIssue.userFeedback.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Community Impact */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-3">
                  <Star className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Community Impact Achievement
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Thank you for making your community better! Your report helped resolve this issue.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Rate & Review Resolution
                </h2>
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedback({ rating: 5, comment: '' });
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    {selectedIssue.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resolved by {selectedIssue.resolvedBy} on {new Date(selectedIssue.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rate the Resolution (1-5 stars)
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedback(prev => ({ ...prev, rating }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= feedback.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({feedback.rating}/5)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Comments *
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Share your experience with the resolution process..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedback.comment.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setFeedback({ rating: 5, comment: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Feedback submitted successfully!
        </div>
      )}
    </div>
  );
}