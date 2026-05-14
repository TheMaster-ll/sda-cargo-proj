import React, { useState, useContext } from 'react';
import {
  Box, IconButton, Badge, Avatar, Menu, MenuItem, Typography, Divider, useTheme, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';
import { getInitials } from '../../utils/helpers';
import { Bell, Sun, Moon, Languages } from 'lucide-react';
import { SIDEBAR_WIDTH } from './Sidebar';
import { useThemeMode } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useContext(NotificationContext);
  const { mode, toggleTheme } = useThemeMode();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const c = theme.palette.custom;
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('cargoport-lang', newLang);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: SIDEBAR_WIDTH,
        right: 0,
        height: 60,
        bgcolor: c.headerBg,
        borderBottom: `1px solid ${c.headerBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        zIndex: 1100
      }}
    >
      <Box />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          onClick={toggleLanguage}
          size="small"
          sx={{
            minWidth: 36, px: 1, py: 0.5, fontWeight: 700, fontSize: '0.75rem',
            color: theme.palette.text.secondary, border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5, textTransform: 'none',
            '&:hover': { bgcolor: theme.palette.action.hover }
          }}
        >
          {i18n.language === 'en' ? 'اردو' : 'EN'}
        </Button>

        <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.secondary }}>
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>

        <IconButton
          onClick={(e) => { setNotifAnchor(e.currentTarget); setNotifOpen(true); }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <Bell size={20} color={theme.palette.text.secondary} />
          </Badge>
        </IconButton>

        <Avatar
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            width: 36, height: 36, bgcolor: c.primaryButton, cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, ml: 0.5
          }}
        >
          {getInitials(user?.name)}
        </Avatar>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>{t('common.profile')}</MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>{t('common.logout')}</MenuItem>
        </Menu>

        <NotificationPanel
          open={notifOpen}
          anchorEl={notifAnchor}
          onClose={() => { setNotifOpen(false); setNotifAnchor(null); }}
        />
      </Box>
    </Box>
  );
}
