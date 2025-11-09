import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener } from '../lib/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [fcmToken, setFcmToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeNotifications();
      fetchNotifications();
    }
  }, [user]);

  const initializeNotifications = async () => {
    console.log('Initializing notifications for user:', user?.name);
    const token = await requestNotificationPermission();
    if (token) {
      console.log('FCM token received:', token.substring(0, 20) + '...');
      setFcmToken(token);
      try {
        const response = await fetch('http://localhost:5000/api/user/fcm-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ fcmToken: token })
        });
        console.log('FCM token update response:', response.status);
      } catch (error) {
        console.error('FCM token update error:', error);
      }
    } else {
      console.log('No FCM token received');
    }
  };

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for user:', user?.name);
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Notifications fetch response:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Notifications received:', data.length);
        setNotifications(Array.isArray(data) ? data : []);
        setUnreadCount(Array.isArray(data) ? data.filter(n => !n.read).length : 0);
      } else {
        console.log('Failed to fetch notifications:', res.status);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  useEffect(() => {
    onMessageListener().then((payload) => {
      const newNotification = {
        _id: Date.now(),
        title: payload.notification.title,
        message: payload.notification.body,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/icon-192x192.png'
      });
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      fcmToken, 
      notifications, 
      unreadCount, 
      markAsRead,
      fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}