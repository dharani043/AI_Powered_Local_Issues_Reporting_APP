import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

export function NotificationTest() {
  const { user } = useAuth();
  const { notifications, unreadCount, fetchNotifications } = useNotifications();

  const testServerConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const result = await response.json();
      console.log('Server health check:', result);
      
      // Also test debug routes
      const debugResponse = await fetch('http://localhost:5000/api/debug/routes');
      const debugResult = await debugResponse.json();
      console.log('Registered routes:', debugResult);
      
      // Test direct notification route
      const directResponse = await fetch('http://localhost:5000/api/notifications/direct-test');
      const directResult = await directResponse.json();
      console.log('Direct notification test:', directResult);
    } catch (error) {
      console.error('Server connection error:', error);
    }
  };

  const createTestNotification = async () => {
    try {
      // First test basic route
      const testResponse = await fetch('http://localhost:5000/api/notifications/test');
      console.log('Basic test route:', testResponse.status, await testResponse.json());
      
      // Then try authenticated route
      const response = await fetch('http://localhost:5000/api/notifications/test-create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('Test notification result:', result);
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Test notification error:', error);
    }
  };

  const createMunicipalityAdmins = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/create-municipality-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      console.log('Create municipality admins result:', result);
      alert(`Created ${result.created?.length || 0} municipality admins`);
    } catch (error) {
      console.error('Create municipality admins error:', error);
    }
  };

  const testStatusUpdate = async () => {
    try {
      // Find a test issue to update
      const issuesResponse = await fetch('http://localhost:5000/api/issues', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const issues = await issuesResponse.json();
      
      if (issues.length > 0) {
        const testIssue = issues[0];
        console.log(`Testing status update for issue: ${testIssue.title}`);
        console.log(`Current status: ${testIssue.status}`);
        console.log(`Reported by: ${testIssue.reportedBy?.name}`);
        
        // Cycle through statuses
        const statuses = ['pending', 'in_progress', 'resolved'];
        const currentIndex = statuses.indexOf(testIssue.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        
        console.log(`Changing status from ${testIssue.status} to ${nextStatus}`);
        
        // Try to update status (this will only work if user is admin)
        const updateResponse = await fetch(`http://localhost:5000/api/issues/${testIssue._id}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: nextStatus })
        });
        
        const result = await updateResponse.json();
        console.log('Status update result:', result);
        
        if (updateResponse.ok) {
          alert(`Status changed to ${nextStatus}! Check server console for notification logs.`);
          fetchNotifications(); // Refresh to see if notification was created
        } else {
          alert(`Failed to update status: ${result.error || 'Unknown error'}`);
        }
      } else {
        console.log('No issues found to test');
      }
    } catch (error) {
      console.error('Test status update error:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
      <h3 className="text-lg font-semibold mb-4">Notification Test Panel</h3>
      <div className="space-y-2">
        <p>User: {user.name} ({user.role})</p>
        <p>Notifications: {notifications.length} (Unread: {unreadCount})</p>
        {user.role === 'admin' ? (
          <p className="text-green-600 font-semibold">✅ Admin Access - Can change issue status</p>
        ) : (
          <p className="text-blue-600">👤 Regular User - Will receive status notifications</p>
        )}
        <div className="space-x-2">
          <button 
            onClick={testServerConnection}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Server
          </button>
          <button 
            onClick={createTestNotification}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Test Notification
          </button>
          <button 
            onClick={createMunicipalityAdmins}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Municipality Admins
          </button>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Notifications
          </button>
          {user.role === 'admin' && (
            <button 
              onClick={testStatusUpdate}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Test Status Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}