import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext(null);

const supabase = createClient(
  'https://xdnplapoknzafuleuzdj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbnBsYXBva256YWZ1bGV1emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDgwMDgsImV4cCI6MjA5MzIyNDAwOH0.K85E_gSg5SbTZ0kEXfQOxwV8Sa6jmvcrxA0lZEFOdDk'
);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n) => !n.isread).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `userid=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationid === id ? { ...n, isread: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isread: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
