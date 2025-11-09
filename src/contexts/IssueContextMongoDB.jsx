// import React, { createContext, useContext, useState, useEffect } from 'react';
// import {
//   getAllIssues,
//   createIssue,
//   updateIssueStatus,
//   deleteIssue,
//   getUserIssues,
//   getIssuesByStatus,
//   searchIssues,
//   addUserFeedback,
//   getIssueStats
// } from '../lib/database.js';

// const IssueContext = createContext(undefined);

// export function IssueProvider({ children }) {
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     inProgress: 0,
//     resolved: 0,
//     resolutionRate: 0
//   });

//   // Load issues from MongoDB on component mount
//   useEffect(() => {
//     loadIssues();
//     loadStats();
//   }, []);

//   const loadIssues = async () => {
//     try {
//       setLoading(true);
//       const issuesData = await getAllIssues();
//       setIssues(issuesData);
//     } catch (error) {
//       console.error('Error loading issues:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const statsData = await getIssueStats();
//       setStats(statsData);
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     }
//   };

//   const addIssue = async (issueData) => {
//     try {
//       const result = await createIssue(issueData);
//       if (result.acknowledged) {
//         // Reload issues to get the updated list
//         await loadIssues();
//         await loadStats();
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error adding issue:', error);
//       return false;
//     }
//   };

//   const updateIssueStatusDB = async (id, status, imageUrl, adminNotes, adminName) => {
//     try {
//       const updateData = {
//         adminNotes,
//       };

//       if (status === 'in_progress') {
//         updateData.inProgressImageUrl = imageUrl;
//       } else if (status === 'resolved') {
//         updateData.rectifiedImage = imageUrl;
//         updateData.resolvedAt = new Date();
//         updateData.resolvedBy = adminName;
//       }

//       const result = await updateIssueStatus(id, status, updateData);
//       if (result.acknowledged) {
//         // Reload issues to get the updated list
//         await loadIssues();
//         await loadStats();
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error updating issue status:', error);
//       return false;
//     }
//   };

//   const addUserFeedbackDB = async (id, rating, comment) => {
//     try {
//       const feedbackData = {
//         rating,
//         comment
//       };

//       const result = await addUserFeedback(id, null, feedbackData); 
//       if (result.issueResult.acknowledged) {
//         // Reload issues to get the updated list
//         await loadIssues();
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error adding feedback:', error);
//       return false;
//     }
//   };

//   const deleteIssueDB = async (id) => {
//     try {
//       const result = await deleteIssue(id);
//       if (result.acknowledged) {
//         // Reload issues to get the updated list
//         await loadIssues();
//         await loadStats();
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error deleting issue:', error);
//       return false;
//     }
//   };

//   const getUserIssuesDB = async (userId) => {
//     try {
//       return await getUserIssues(userId);
//     } catch (error) {
//       console.error('Error getting user issues:', error);
//       return [];
//     }
//   };

//   const getIssuesByStatusDB = async (status) => {
//     try {
//       return await getIssuesByStatus(status);
//     } catch (error) {
//       console.error('Error getting issues by status:', error);
//       return [];
//     }
//   };

//   const searchIssuesDB = async (query) => {
//     try {
//       return await searchIssues(query);
//     } catch (error) {
//       console.error('Error searching issues:', error);
//       return [];
//     }
//   };

//   return (
//     <IssueContext.Provider value={{
//       issues,
//       loading,
//       stats,
//       addIssue,
//       updateIssueStatus: updateIssueStatusDB,
//       deleteIssue: deleteIssueDB,
//       addUserFeedback: addUserFeedbackDB,
//       getUserIssues: getUserIssuesDB,
//       getIssuesByStatus: getIssuesByStatusDB,
//       searchIssues: searchIssuesDB,
//       refreshIssues: loadIssues,
//       refreshStats: loadStats
//     }}>
//       {children}
//     </IssueContext.Provider>
//   );
// }

// export function useIssues() {
//   const context = useContext(IssueContext);
//   if (!context) {
//     throw new Error('useIssues must be used within an IssueProvider');
//   }
//   return context;
// }