import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const IssueContext = createContext(undefined);

const getAuthHeaders = () => {
  const token = localStorage.getItem('civic_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0,
  });

  useEffect(() => {
    loadIssues();
    loadStats();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/issues', { headers: getAuthHeaders() });
      setIssues(res.data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get('/api/issues/stats', { headers: getAuthHeaders() });
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const addIssue = async (issueData) => {
    try {
      const res = await axios.post('/api/issues', issueData, { headers: getAuthHeaders() });
      if (res.status === 201 || res.status === 200) {
        await loadIssues();
        await loadStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding issue:', error);
      return false;
    }
  };

  const updateIssueStatusDB = async (id, status, imageUrl, adminNotes, adminName) => {
    try {
      const updateData = { adminNotes };

      if (status === 'in_progress') {
        updateData.inProgressImageUrl = imageUrl;
      } else if (status === 'resolved') {
        updateData.resolvedImageUrl = imageUrl;
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = adminName;
      }

      const res = await axios.patch(`/api/issues/${id}/status`, {
        status,
        updateData,
      }, { headers: getAuthHeaders() });

      if (res.status === 200) {
        await loadIssues();
        await loadStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating issue status:', error);
      return false;
    }
  };

  const addUserFeedbackDB = async (id, rating, comment) => {
    try {
      const res = await axios.post(`/api/issues/${id}/feedback`, {
        rating,
        comment,
      }, { headers: getAuthHeaders() });

      if (res.status === 200 || res.status === 201) {
        await loadIssues();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding feedback:', error);
      return false;
    }
  };

  const deleteIssueDB = async (id) => {
    try {
      const res = await axios.delete(`/api/issues/${id}`, { headers: getAuthHeaders() });
      if (res.status === 200) {
        await loadIssues();
        await loadStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting issue:', error);
      return false;
    }
  };

  const getUserIssuesDB = async (userId) => {
    try {
      const res = await axios.get(`/api/issues/user/${userId}`, { headers: getAuthHeaders() });
      return res.data || [];
    } catch (error) {
      console.error('Error getting user issues:', error);
      return [];
    }
  };

  const getIssuesByStatusDB = async (status) => {
    try {
      const res = await axios.get(`/api/issues/status/${status}`, { headers: getAuthHeaders() });
      return res.data || [];
    } catch (error) {
      console.error('Error getting issues by status:', error);
      return [];
    }
  };

  const searchIssuesDB = async (query) => {
    try {
      const res = await axios.get(`/api/issues/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      return res.data || [];
    } catch (error) {
      console.error('Error searching issues:', error);
      return [];
    }
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        stats,
        addIssue,
        updateIssueStatus: updateIssueStatusDB,
        deleteIssue: deleteIssueDB,
        addUserFeedback: addUserFeedbackDB,
        getUserIssues: getUserIssuesDB,
        getIssuesByStatus: getIssuesByStatusDB,
        searchIssues: searchIssuesDB,
        refreshIssues: loadIssues,
        refreshStats: loadStats,
      }}
    >
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
