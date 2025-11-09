// import React, { createContext, useContext, useState } from 'react';

// const IssueContext = createContext(undefined);

// // Mock data simulating MongoDB documents
// const initialIssues = [
//   {
//     id: '1',
//     title: 'Large pothole on Main Street',
//     description: 'Deep pothole causing damage to vehicles. Located near the intersection with Oak Avenue.',
//     category: 'pothole',
//     status: 'resolved',
//     priority: 'high',
//     location: '123 Main Street, Downtown',
//     coordinates: { lat: 40.7128, lng: -74.0060 },
//     imageUrl: 'https://images.pexels.com/photos/220989/pexels-photo-220989.jpeg?auto=compress&cs=tinysrgb&w=400',
//     resolvedImageUrl: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=400',
//     reportedBy: '2',
//     reportedByName: 'John Citizen',
//     reportedAt: new Date('2024-01-15T10:30:00'),
//     resolvedAt: new Date('2024-01-20T14:45:00'),
//     resolvedBy: 'Admin User',
//     votes: 15,
//     adminNotes: 'Pothole filled with asphalt and road surface restored. Work completed by city maintenance crew.',
//     userFeedback: {
//       rating: 5,
//       comment: 'Excellent work! The road is now smooth and safe. Thank you for the quick response.',
//       submittedAt: new Date('2024-01-21T09:15:00')
//     }
//   },
//   {
//     id: '2',
//     title: 'Broken streetlight on Park Avenue',
//     description: 'Street light has been flickering for weeks and now completely dark. Safety concern for pedestrians.',
//     category: 'streetlight',
//     status: 'in_progress',
//     priority: 'medium',
//     location: '456 Park Avenue, Residential District',
//     coordinates: { lat: 40.7580, lng: -73.9855 },
//     imageUrl: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
//     inProgressImageUrl: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400',
//     reportedBy: '2',
//     reportedByName: 'John Citizen',
//     reportedAt: new Date('2024-01-18T20:15:00'),
//     votes: 8
//   },
//   {
//     id: '3',
//     title: 'Water leak at bus stop',
//     description: 'Continuous water leak creating puddles and ice hazard in winter.',
//     category: 'water_leak',
//     status: 'pending',
//     priority: 'high',
//     location: '789 Transit Way, Bus Stop #12',
//     imageUrl: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
//     reportedBy: '2',
//     reportedByName: 'John Citizen',
//     reportedAt: new Date('2024-01-20T08:45:00'),
//     votes: 12
//   },
//   {
//     id: '4',
//     title: 'Overflowing trash bin in Central Park',
//     description: 'Trash bin has been overflowing for several days, attracting pests and creating unsanitary conditions.',
//     category: 'trash',
//     status: 'resolved',
//     priority: 'medium',
//     location: 'Central Park, Near Playground',
//     imageUrl: 'https://images.pexels.com/photos/2827753/pexels-photo-2827753.jpeg?auto=compress&cs=tinysrgb&w=400',
//     resolvedImageUrl: 'https://images.pexels.com/photos/1909656/pexels-photo-1909656.jpeg?auto=compress&cs=tinysrgb&w=400',
//     reportedBy: '2',
//     reportedByName: 'John Citizen',
//     reportedAt: new Date('2024-01-12T16:20:00'),
//     resolvedAt: new Date('2024-01-14T11:30:00'),
//     resolvedBy: 'Admin User',
//     votes: 6,
//     adminNotes: 'Trash collected and bin cleaned. Increased collection frequency for this location.'
//   }
// ];

// export function IssueProvider({ children }) {
//   const [issues, setIssues] = useState(initialIssues);

//   const addIssue = (issueData) => {
//     const newIssue = {
//       ...issueData,
//       id: Date.now().toString(),
//       reportedAt: new Date(),
//       votes: 0
//     };
//     setIssues(prev => [newIssue, ...prev]);
//   };

//   const updateIssueStatus = (id, status, imageUrl, adminNotes, adminName) => {
//     setIssues(prev => prev.map(issue => {
//       if (issue.id === id) {
//         const updates = {
//           status,
//           adminNotes,
//         };

//         if (status === 'in_progress') {
//           updates.inProgressImageUrl = imageUrl;
//         } else if (status === 'resolved') {
//           updates.resolvedImageUrl = imageUrl;
//           updates.resolvedAt = new Date();
//           updates.resolvedBy = adminName;
//         }

//         return { ...issue, ...updates };
//       }
//       return issue;
//     }));
//   };

//   const addUserFeedback = (id, rating, comment) => {
//     setIssues(prev => prev.map(issue => 
//       issue.id === id ? {
//         ...issue,
//         userFeedback: {
//           rating,
//           comment,
//           submittedAt: new Date()
//         }
//       } : issue
//     ));
//   };

//   const deleteIssue = (id) => {
//     setIssues(prev => prev.filter(issue => issue.id !== id));
//   };

//   const getUserIssues = (userId) => {
//     return issues.filter(issue => issue.reportedBy === userId);
//   };

//   const getIssuesByStatus = (status) => {
//     return issues.filter(issue => issue.status === status);
//   };

//   const searchIssues = (query) => {
//     const lowerQuery = query.toLowerCase();
//     return issues.filter(issue =>
//       issue.title.toLowerCase().includes(lowerQuery) ||
//       issue.description.toLowerCase().includes(lowerQuery) ||
//       issue.location.toLowerCase().includes(lowerQuery)
//     );
//   };

//   return (
//     <IssueContext.Provider value={{
//       issues,
//       addIssue,
//       updateIssueStatus,
//       deleteIssue,
//       addUserFeedback,
//       getUserIssues,
//       getIssuesByStatus,
//       searchIssues
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