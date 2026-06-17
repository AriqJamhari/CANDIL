import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, MailOpen, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const NotifikasiDropdown = () => {
  const { user, socket } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifikasi');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (socket && user) {
      const handleUserNotif = (data) => {
        setNotifications(prev => [
          { id: Date.now(), pesan: data.pesan, is_read: false, created_at: new Date().toISOString() },
          ...prev
        ]);
      };

      const handleBroadcastNotif = (data) => {
        setNotifications(prev => [
          { id: Date.now(), pesan: `[BROADCAST] ${data.pesan}`, is_read: false, created_at: new Date().toISOString() },
          ...prev
        ]);
      };

      socket.on(`notification_${user.id}`, handleUserNotif);
      socket.on('notification', handleBroadcastNotif);

      return () => {
        socket.off(`notification_${user.id}`, handleUserNotif);
        socket.off('notification', handleBroadcastNotif);
      };
    }
  }, [socket, user]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const markAllRead = async () => {
    try {
      await axiosInstance.patch('/notifikasi/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifikasi/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notif-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: 'var(--text-primary)', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderRadius: '50%',
          transition: 'var(--transition-smooth)'
        }}
        className="notif-btn"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: 'var(--accent-teal)',
            color: '#0a071b',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-neon-teal)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="glass-panel" 
          style={{
            position: 'absolute',
            right: 0,
            top: '45px',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            animation: 'fadeIn 0.2s ease forwards',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: '8px',
            marginBottom: '8px'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>Notifikasi</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-teal)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={12} /> Tandai semua dibaca
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {notifications.length === 0 ? (
              <div style={{ 
                padding: '24px 0', 
                textAlign: 'center', 
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MailOpen size={24} />
                <span>Tidak ada notifikasi</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.is_read && markSingleRead(notif.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid',
                    borderColor: notif.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.15)',
                    cursor: notif.is_read ? 'default' : 'pointer',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  className={notif.is_read ? '' : 'notif-item-unread'}
                >
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {notif.pesan}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
                    {formatTime(notif.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotifikasiDropdown;
