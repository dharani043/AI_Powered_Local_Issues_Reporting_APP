import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, MapPin, Calendar, Users, AlertTriangle, Building2 } from 'lucide-react';
import { useIssues } from '../contexts/IssueContextAPI';
import { useAuth } from '../contexts/AuthContext';

export function AnalyticsPage() {
  const { issues } = useIssues();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');

  const getFilteredIssues = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredByTime = issues.filter(issue => new Date(issue.createdAt) >= cutoffDate);
    
    // Filter by municipality for municipality admins
    if (user?.role === 'municipality_admin') {
      filteredByTime = filteredByTime.filter(issue => 
        issue.municipalityId === user.municipalityId
      );
    }
    
    return filteredByTime;
  };

  const filteredIssues = getFilteredIssues();

  const categoryStats = filteredIssues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const statusStats = filteredIssues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1;
    return acc;
  }, {});

  const priorityStats = filteredIssues.reduce((acc, issue) => {
    acc[issue.priority] = (acc[issue.priority] || 0) + 1;
    return acc;
  }, {});

  const resolutionRate = filteredIssues.length > 0 
    ? ((statusStats.resolved || 0) / filteredIssues.length * 100).toFixed(1)
    : 0;

  const avgResolutionTime = filteredIssues
    .filter(issue => issue.status === 'resolved')
    .reduce((acc, issue) => {
      const created = new Date(issue.createdAt);
      const updated = new Date(issue.updatedAt);
      return acc + (updated - created);
    }, 0) / (statusStats.resolved || 1);

  const avgDays = Math.round(avgResolutionTime / (1000 * 60 * 60 * 24));

  // Check access for municipality admin
  if (user?.role === 'municipality_admin' && !user.municipalityId) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Municipality Not Configured</h2>
        <p className="text-gray-600 dark:text-gray-400">Please contact admin to configure your municipality</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.role === 'municipality_admin' ? `${user.municipalityName} Analytics` : 'Analytics Dashboard'}
            </h1>
            <p className="text-purple-100">
              {user?.role === 'municipality_admin' 
                ? `Municipality ID: ${user.municipalityId} | Pincode: ${user.pincode}`
                : 'Insights and trends for civic issues'
              }
            </p>
          </div>
          {user?.role === 'municipality_admin' ? (
            <Building2 className="w-16 h-16 text-purple-200" />
          ) : (
            <BarChart3 className="w-16 h-16 text-purple-200" />
          )}
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredIssues.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{avgDays} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {new Set(filteredIssues.map(i => i.reportedBy?._id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / filteredIssues.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues by Status</h3>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'pending' ? 'bg-yellow-500' :
                        status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / filteredIssues.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issues by Priority</h3>
          <div className="space-y-3">
            {Object.entries(priorityStats).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{priority}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        priority === 'high' ? 'bg-red-500' :
                        priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / filteredIssues.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {filteredIssues.slice(0, 5).map((issue) => (
              <div key={issue._id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  issue.status === 'resolved' ? 'bg-green-500' :
                  issue.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {issue.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(issue.createdAt).toLocaleDateString()} • {issue.reportedBy?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}