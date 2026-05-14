import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, Divider, Button, useTheme } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { SIDEBAR_ITEMS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard, Package, Truck, Users, Receipt, BarChart3,
  Settings, DollarSign, ClipboardList, Activity, LogOut, HelpCircle,
  Shield, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Package: Package,
  Truck: Truck,
  Users: Users,
  Receipt: Receipt,
  BarChart3: BarChart3,
  Settings: Settings,
  DollarSign: DollarSign,
  ClipboardList: ClipboardList,
  Activity: Activity
};

const SIDEBAR_WIDTH = 220;

// Map sidebar label keys to translation keys
const LABEL_KEYS = {
  'Dashboard': 'sidebar.dashboard',
  'Orders': 'sidebar.orders',
  'Invoices': 'sidebar.invoices',
  'Settings': 'common.settings',
  'Shipments': 'sidebar.shipments',
  'Fleet': 'sidebar.fleet',
  'Billing': 'sidebar.billing',
  'Reports': 'sidebar.reports',
  'Users': 'sidebar.users',
  'Carriers': 'sidebar.carriers',
  'Rates': 'sidebar.rates',
  'System Status': 'sidebar.systemStatus',
  'My Shipments': 'sidebar.myShipments',
  'Pickups Today': 'sidebar.pickupsToday',
  'Earnings': 'sidebar.earnings'
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const sb = theme.palette.sidebar;

  if (!user) return null;
  const items = SIDEBAR_ITEMS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user.role === 'CarrierPartner' ? t('sidebar.carrierPartner') : user.role;

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        minHeight: '100vh',
        bgcolor: sb.bg,
        color: sb.text,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: sb.hover, width: 36, height: 36, fontSize: 14, fontWeight: 700, border: '2px solid #334155' }}>
          CP
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
            CargoPort
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
            {t('sidebar.logisticsPortal')}
          </Typography>
        </Box>
      </Box>

      {user.role === 'CarrierPartner' && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: sb.hover, borderRadius: 1 }}>
            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#334155' }}>
              {getInitials(user.name)}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                {user.companyName || user.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.6rem' }}>
                {roleLabel}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {user.role === 'Dispatcher' && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{ bgcolor: sb.active, color: sb.activeText, '&:hover': { bgcolor: theme.palette.secondary.dark }, fontWeight: 600, fontSize: '0.8rem' }}
            onClick={() => navigate('/dispatcher/orders/create')}
          >
            {t('sidebar.createShipment')}
          </Button>
        </Box>
      )}

      <List sx={{ flex: 1, px: 1 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const IconComp = iconMap[item.icon] || Package;
          return (
            <ListItem
              key={item.path}
              button
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.3,
                py: 1,
                px: 1.5,
                bgcolor: isActive ? sb.active : 'transparent',
                color: isActive ? sb.activeText : sb.text,
                '&:hover': { bgcolor: isActive ? sb.active : sb.hover, color: isActive ? sb.activeText : '#fff' },
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                <IconComp size={18} />
              </ListItemIcon>
              <ListItemText
                primary={t(LABEL_KEYS[item.label] || item.label)}
                primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500 }}
              />
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: sb.hover }} />
      <List sx={{ px: 1, pb: 1 }}>
        {user.role === 'Admin' ? (
          <ListItem
            button
            onClick={() => navigate('/admin/policies')}
            sx={{ borderRadius: 1.5, py: 1, px: 1.5, '&:hover': { bgcolor: sb.hover, color: '#fff' }, cursor: 'pointer' }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: sb.text }}>
              <FileText size={18} />
            </ListItemIcon>
            <ListItemText primary={t('sidebar.controlPolicy')} primaryTypographyProps={{ fontSize: '0.82rem' }} />
          </ListItem>
        ) : (
          <>
            <ListItem
              button
              onClick={() => navigate('/dashboard/help')}
              sx={{ borderRadius: 1.5, py: 1, px: 1.5, '&:hover': { bgcolor: sb.hover, color: '#fff' }, cursor: 'pointer' }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: sb.text }}>
                <HelpCircle size={18} />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.helpSupport')} primaryTypographyProps={{ fontSize: '0.82rem' }} />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/privacy-policy')}
              sx={{ borderRadius: 1.5, py: 1, px: 1.5, '&:hover': { bgcolor: sb.hover, color: '#fff' }, cursor: 'pointer' }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: sb.text }}>
                <Shield size={18} />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.privacyPolicy')} primaryTypographyProps={{ fontSize: '0.82rem' }} />
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/dashboard/terms-of-service')}
              sx={{ borderRadius: 1.5, py: 1, px: 1.5, '&:hover': { bgcolor: sb.hover, color: '#fff' }, cursor: 'pointer' }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: sb.text }}>
                <FileText size={18} />
              </ListItemIcon>
              <ListItemText primary={t('sidebar.termsOfService')} primaryTypographyProps={{ fontSize: '0.82rem' }} />
            </ListItem>
          </>
        )}
        <ListItem
          button
          onClick={handleLogout}
          sx={{ borderRadius: 1.5, py: 1, px: 1.5, '&:hover': { bgcolor: sb.hover, color: '#ef4444' }, cursor: 'pointer' }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: '#ef4444' }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText primary={t('common.logout')} primaryTypographyProps={{ fontSize: '0.82rem', color: '#ef4444' }} />
        </ListItem>
      </List>
    </Box>
  );
}

export { SIDEBAR_WIDTH };
