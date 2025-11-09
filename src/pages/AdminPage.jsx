import React, { useState } from 'react';
import { 
  Users, FileText, CheckCircle, Clock, AlertCircle, Eye, Edit, Trash2, 
  Upload, X, Shield, Ban, Search, BarChart3, TrendingUp, Activity
} from 'lucide-react';
import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';

export function AdminPage() {
 
  const { issues, updateIssueStatus, deleteIssue } = useIssues();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusData, setStatusData] = useState({
    newStatus: '',
    imageUrl: '',
    adminNotes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!user || user.role !== 'municipality_admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Municipality admin privileges required to access this page
          </p>
        </div>
      </div>
    );
  }

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.reportedBy?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (issue, newStatus) => {
    if (newStatus === 'pending') {
      // Pending doesn't require image
            if (!selectedIssue || !selectedIssue._id) {
        console.error('Invalid issue selected');
        return;
      }

      updateIssueStatus(issue._id, newStatus, '', '', user.name);
    } else {
      // In Progress and Resolved require images
      setSelectedIssue(issue);
      setStatusData({
        newStatus,
        imageUrl: 'upload/image.png', // Placeholder to indicate image is required
        adminNotes: ''
      });
      setShowStatusModal(true);
    }
  };

  const handleStatusSubmit = async () => {
    if (selectedIssue && statusData.imageUrl && statusData.adminNotes.trim()) {
      try {
        await updateIssueStatus(
          selectedIssue._id, 
          statusData.newStatus, 
          statusData.imageUrl, 
          statusData.adminNotes, 
          user.name
        );
        
        setShowStatusModal(false);
        setSelectedIssue(null);
        setStatusData({ newStatus: '', imageUrl: '', adminNotes: '' });
        alert(`Issue status has been updated to ${statusData.newStatus} and user will be notified!`);
      }  catch (error) {
        alert(error.response?.data?.message || 'Failed to update issue status.');
      }
    } else {
      alert('Please provide both an image and admin notes.');
    }
  };
    const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatusData(prev => ({
        ...prev,
        imageUrl: file // Store the file object instead of data URL
      }));
    }
  };

  const totalIssues = issues.length;
  const pendingIssues = issues.filter(i => i.status === 'pending').length;
  const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Municipality Admin Dashboard</h1>
            <p className="text-purple-100">Oversee all corporations and manage system performance</p>
          </div>
          <Shield className="w-16 h-16 text-purple-200" />
        </div>
      </div>



      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalIssues}</p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pendingIssues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressIssues}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolution Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{resolutionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues by title, location, or reporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Management Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Management</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIssues.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {issue.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {issue.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {issue.reportedBy?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusUpdate(issue, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-purple-500 ${
                        issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}
                    >
                      {console.log(new Date(issue.reportedAt).toLocaleDateString())}
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      issue.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {issue.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusUpdate(issue, 'resolved')}
                          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteIssue(issue._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && !showStatusModal && (
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

                  {/* console.log({imageUrl}) */}
                  {/* console.log({selectedIssue.image}) */}
                  {/* In the issue detail modal, fix the image display: */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedIssue.image && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Reported Image
                        </h4>
                        <img
                          src={`http://localhost:5000/${selectedIssue.image.replace(/\\/g, '/')}`}
                          alt="Reported Issue"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {selectedIssue.inProgressImageUrl && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          In Progress Image
                        </h4>
                        <img
                          src={`http://localhost:5000/${selectedIssue.inProgressImageUrl.replace(/\\/g, '/')}`}
                          alt="In Progress"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {selectedIssue.rectifiedImage && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          Resolved Image
                        </h4>
                        <img
                          src={`http://localhost:5000/${selectedIssue.rectifiedImage.replace(/\\/g, '/')}`}
                          alt="Resolved"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* {selectedIssue.inProgressImageUrl && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        In Progress Image
                      </h4>
                      <img
                        src={selectedIssue.inProgressImageUrl}
                        alt="In Progress"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {selectedIssue.rectifiedImage && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Resolved Image
                      </h4>
                      <img
                        src={selectedIssue.rectifiedImage.startsWith('http')
                          ? selectedIssue.rectifiedImage
                          : `http://localhost:5000/${selectedIssue.rectifiedImage}`}
                        alt="Resolved"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )} */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reporter</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.reportedBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.location}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Priority</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIssue.priority}</p>
                  </div>
                </div>

                {selectedIssue.adminNotes && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Admin Notes
                    </h4>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      {selectedIssue.adminNotes}
                    </p>
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
                      Submitted on {new Date(selectedIssue.userFeedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Update Issue Status
                </h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedIssue(null);
                    setStatusData({ newStatus: '', imageUrl: '', adminNotes: '' });
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
                    {selectedIssue.location}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Updating status to: <strong>{statusData.newStatus.replace('_', ' ')}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload {statusData.newStatus.replace('_', ' ')} Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    {statusData.imageUrl ? (
                      <div className="relative">
                        <img
                          src={statusData.imageUrl}
                          alt="Status Update"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={() => setStatusData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            Upload {statusData.newStatus.replace('_', ' ')} image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes *
                  </label>
                  <textarea
                    value={statusData.adminNotes}
                    onChange={(e) => setStatusData(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Describe the ${statusData.newStatus.replace('_', ' ')} actions taken...`}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleStatusSubmit}
                    disabled={!statusData.imageUrl || !statusData.adminNotes}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedIssue(null);
                      setStatusData({ newStatus: '', imageUrl: '', adminNotes: '' });
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
    </div>
  );
}