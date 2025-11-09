import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const IssueContext = createContext(undefined);
const API_BASE_URL = 'http://localhost:5000/api';

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0
  });


  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  const handleUnauthorized = (error) => {
    if (error?.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        console.warn('Unauthorized, redirecting...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadIssues();
      loadStats();
    }

    // Listen for login events to refresh data
    const handleUserLogin = () => {
      const token = localStorage.getItem('token');
      if (token) {
        loadIssues();
        loadStats();
      }
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    return () => window.removeEventListener('userLoggedIn', handleUserLogin);
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/issues`, getAuthHeaders());
      setIssues(res.data);
    } catch (error) {
      handleUnauthorized(error);
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/issues/analytics/stats`, getAuthHeaders());
      setStats(res.data);
    } catch (error) {
      handleUnauthorized(error);
      console.error('Error loading stats:', error);
    }
  };

  const addIssue = async (issueData) => {
    try {
      await axios.post(`${API_BASE_URL}/issues`, issueData, getAuthHeaders());
      await loadIssues();
      await loadStats();
      return true;
    } catch (error) {
      handleUnauthorized(error);
      console.error('Error adding issue:', error);
      return false;
    }
  };

  const updateIssueStatus = async (issueId, newStatus, imageFile, adminNotes, updatedByName) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('adminNotes', adminNotes);
      
      // If there's an image file, append it
      if (imageFile && typeof imageFile !== 'string') {
        formData.append('statusImage', imageFile);
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/issues/${issueId}/status-update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      const updatedIssue = await response.json();
      
      // Update local state
      setIssues(prev => prev.map(issue => 
        issue._id === issueId ? updatedIssue : issue
      ));
      
      // Reload stats to get updated counts
      await loadStats();
      
      return updatedIssue;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  };

  const addUserFeedback = async (id, feedbackData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/issues/${id}/feedback`, feedbackData, getAuthHeaders());
      
      // Update the specific issue in local state with the feedback
      setIssues(prev => prev.map(issue => {
        if (issue._id === id || issue.id === id) {
          return {
            ...issue,
            userFeedback: feedbackData
          };
        }
        return issue;
      }));
      
      return true;
    } catch (error) {
      handleUnauthorized(error);
      console.error('Error adding feedback:', error);
      return false;
    }
  };

  const deleteIssue = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/issues/${id}`, getAuthHeaders());
      await loadIssues();
      await loadStats();
      return true;
    } catch (error) {
      handleUnauthorized(error);
      console.error('Error deleting issue:', error);
      return false;
    }
  };

  const getUserIssues = (userId) => {
    return issues.filter(issue => {
      const reportedById = typeof issue.reportedBy === 'object' ? issue.reportedBy._id : issue.reportedBy;
      return reportedById === userId;
    });
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  const searchIssues = (query) => {
    const lowerQuery = query.toLowerCase();
    return issues.filter(issue =>
      issue.title.toLowerCase().includes(lowerQuery) ||
      issue.description.toLowerCase().includes(lowerQuery) ||
      issue.location.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <IssueContext.Provider value={{
      issues,
      loading,
      stats,
      addIssue,
      updateIssueStatus,
      deleteIssue,
      addUserFeedback,
      getUserIssues,
      getIssuesByStatus,
      searchIssues,
      refreshIssues: loadIssues,
      refreshStats: loadStats
    }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}