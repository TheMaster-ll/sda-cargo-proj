import React, { useContext } from 'react';
import { Popover, Box, Typography, List, ListItem, ListItemText, Button, Divider, IconButton, useTheme } from '@mui/material';
import { NotificationContext } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';
import { Bell, CheckCheck, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

const typeIcons = {
  Info: Info,
  Warning: AlertTriangle,
  Error: XCircle,
  Success: CheckCircle
};

const typeColors = {
  Info: '#3b82f6',
  Warning: '#f59e0b',
  Error: '#ef4444',
  Success: '#10b981'
};

export default function NotificationPanel({ open, anchorEl, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { notifications, markAsRead, markAllAsRead } = useContext(NotificationContext);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { width: 380, maxHeight: 480, borderRadius: 2 } }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
        <Button size="small" startIcon={<CheckCheck size={14} />} onClick={markAllAsRead} sx={{ fontSize: '0.75rem' }}>
          Mark all read
        </Button>
      </Box>
      <Divider />
      <List sx={{ py: 0, maxHeight: 380, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Bell size={32} color="#cbd5e1" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No notifications</Typography>
          </Box>
        ) : (
          notifications.slice(0, 15).map((n) => {
            const IconComp = typeIcons[n.notificationtype] || Info;
            const iconColor = typeColors[n.notificationtype] || '#64748b';
            return (
              <ListItem
                key={n.notificationid}
                onClick={() => !n.isread && markAsRead(n.notificationid)}
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: n.isread ? 'transparent' : (isDark ? '#1e293b' : '#f0f9ff'),
                  borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                  cursor: n.isread ? 'default' : 'pointer',
                  '&:hover': { bgcolor: n.isread ? (isDark ? '#334155' : '#f8fafc') : (isDark ? '#334155' : '#e0f2fe') }
                }}
              >
                <Box sx={{ mr: 1.5, mt: 0.5 }}>
                  <IconComp size={18} color={iconColor} />
                </Box>
                <ListItemText
                  primary={n.title}
                  secondary={
                    <>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {n.message}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {timeAgo(n.createdat)}
                      </Typography>
                    </>
                  }
                  primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: n.isread ? 400 : 600 }}
                />
              </ListItem>
            );
          })
        )}
      </List>
    </Popover>
  );
}
