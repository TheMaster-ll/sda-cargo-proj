import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, InputAdornment,
  LinearProgress, Divider, Chip, Avatar, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, timeAgo } from '../../utils/helpers';
import {
  Truck, Navigation, CheckCircle, DollarSign, Plus, Search, Receipt,
  Package, ArrowRight, Clock, MapPin, TrendingUp
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function CustomerDashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textAccent = isDark ? '#e2e8f0' : '#1a3a4a';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders } = useFetch('/orders/my');
  const [trackCode, setTrackCode] = useState('');

  const allOrders = orders || [];
  const activeShipments = allOrders.filter((o) =>
    ['Assigned', 'In Transit', 'Picked Up'].includes(o.status) ||
    o.shipments?.some((s) => !['Delivered', 'Cancelled'].includes(s.status))
  ).length;
  const inTransit = allOrders.filter((o) =>
    o.shipments?.some((s) => ['In Transit', 'InTransit'].includes(s.status))
  ).length;
  const now = new Date();
  const deliveredThisMonth = allOrders.filter((o) =>
    o.status === 'Completed' && new Date(o.createdat).getMonth() === now.getMonth()
  ).length;
  const totalSpent = allOrders.reduce((sum, o) => sum + (Number(o.estimatedcost) || 0), 0);

  const recentOrders = allOrders.slice(0, 5);
  const liveShipment = allOrders.find((o) =>
    o.shipments?.some((s) => ['In Transit', 'InTransit'].includes(s.status))
  );
  const pendingCount = allOrders.filter((o) => o.status === 'Pending').length;

  const handleTrack = async () => {
    if (!trackCode.trim()) return;
    try {
      const { data } = await api.get(`/shipments/track/${trackCode.trim()}`);
      if (data.success) {
        toast.success('Shipment found!');
      }
    } catch {
      toast.error('Shipment not found');
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = monthNames[now.getMonth()];

  return (
    <Box>
      {/* Welcome header */}
<<<<<<< HEAD
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            {t('customerDash.welcomeBack', { name: user?.firstName || user?.name?.split(' ')[0] })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('customerDash.overview')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/customer/orders/create')}
          sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 600, '&:hover': { bgcolor: '#d97706' } }}
        >
          {t('customerDash.newOrder')}
        </Button>
=======
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {t('customerDash.welcomeBack', { name: user?.firstName || user?.name?.split(' ')[0] })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('customerDash.overview')}
        </Typography>
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
<<<<<<< HEAD
        <StatCard title={t('customerDash.activeShipments')} value={activeShipments} icon={Truck} color="#1a3a4a" trend={pendingCount > 0 ? `+${pendingCount}` : undefined} />
        <StatCard title={t('customerDash.inTransit')} value={inTransit} icon={Navigation} color="#f59e0b" />
        <StatCard title={t('customerDash.deliveredMonth')} value={deliveredThisMonth} icon={CheckCircle} color="#10b981" trend={deliveredThisMonth > 0 ? `+${Math.round((deliveredThisMonth / Math.max(allOrders.length, 1)) * 100)}%` : undefined} />
        <StatCard title={`${t('customerDash.totalSpent')} (${currentMonth})`} value={formatCurrency(totalSpent)} icon={DollarSign} color="#ef4444" />
=======
        <StatCard title={t('customerDash.activeShipments')} value={activeShipments} icon={Truck} color={isDark ? '#2dd4bf' : '#1a3a4a'} trend={pendingCount > 0 ? `+${pendingCount}` : undefined} />
        <StatCard title={t('customerDash.inTransit')} value={inTransit} icon={Navigation} color={isDark ? '#fbbf24' : '#f59e0b'} />
        <StatCard title={t('customerDash.deliveredMonth')} value={deliveredThisMonth} icon={CheckCircle} color="#10b981" trend={deliveredThisMonth > 0 ? `+${Math.round((deliveredThisMonth / Math.max(allOrders.length, 1)) * 100)}%` : undefined} />
        <StatCard title={`${t('customerDash.totalSpent')} (${currentMonth})`} value={formatCurrency(totalSpent)} icon={DollarSign} color={isDark ? '#f87171' : '#ef4444'} />
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
      </Box>

      {/* Main content area */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left column */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Recent Orders */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2.5, pb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={700}>{t('customerDash.recentOrders')}</Typography>
                <Button
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  onClick={() => navigate('/customer/orders')}
                  sx={{ color: textAccent, fontWeight: 600 }}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>

              {/* Table header */}
              <Box sx={{ display: 'flex', px: 3, py: 1, bgcolor: isDark ? '#0f172a' : '#f8fafc', borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flex: 2 }}>{t('myOrders.orderNumber')}</Typography>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flex: 2 }}>{t('myOrders.route')}</Typography>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flex: 1 }}>{t('common.date')}</Typography>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ flex: 1, textAlign: 'right' }}>{t('common.status')}</Typography>
              </Box>

              {recentOrders.map((order) => (
                <Box
                  key={order.orderid}
                  sx={{
                    display: 'flex', alignItems: 'center', px: 3, py: 1.5,
                    borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`, cursor: 'pointer',
                    '&:hover': { bgcolor: isDark ? '#334155' : '#f8fafc' }, transition: 'background-color 0.15s'
                  }}
                  onClick={() => navigate(`/customer/orders/${order.orderid}`)}
                >
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: textAccent }}>{order.ordernumber}</Typography>
                  </Box>
                  <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">{order.pickup?.city || '—'}</Typography>
                    <ArrowRight size={12} color="#94a3b8" />
                    <Typography variant="body2" color="text.secondary">{order.delivery?.city || '—'}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>{formatDate(order.createdat)}</Typography>
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <StatusBadge status={order.status} />
                  </Box>
                </Box>
              ))}

              {recentOrders.length === 0 && (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                  <Package size={40} color="#cbd5e1" />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No orders yet. Create your first shipment!
                  </Typography>
                  <Button
                    size="small" variant="outlined"
                    onClick={() => navigate('/customer/orders/create')}
                    sx={{ mt: 2, borderColor: textAccent, color: textAccent }}
                  >
                    Create Order
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Activity overview */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Order Summary</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                {[
                  { label: 'Pending', count: allOrders.filter(o => o.status === 'Pending').length, color: '#f59e0b', bg: '#fef3c7' },
                  { label: 'Active', count: activeShipments, color: '#3b82f6', bg: '#dbeafe' },
                  { label: 'Completed', count: allOrders.filter(o => o.status === 'Completed').length, color: '#10b981', bg: '#d1fae5' }
                ].map((item) => (
                  <Box key={item.label} sx={{ textAlign: 'center', p: 2, bgcolor: item.bg, borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: item.color }}>{item.count}</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: item.color }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>

              {allOrders.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {Math.round((allOrders.filter(o => o.status === 'Completed').length / allOrders.length) * 100)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round((allOrders.filter(o => o.status === 'Completed').length / allOrders.length) * 100)}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 4 } }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Live Shipment */}
          {liveShipment && liveShipment.shipments?.[0] && (
            <Card sx={{ borderRadius: 2, border: '1px solid #dbeafe', bgcolor: '#f8fafc' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{t('customerDash.liveTracking')}</Typography>
                  <StatusBadge status="In Transit" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tracking Code</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: textAccent }}>{liveShipment.shipments[0].trackingcode}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Route</Typography>
                    <Typography variant="body2" fontWeight={600}>{liveShipment.pickup?.city} → {liveShipment.delivery?.city}</Typography>
                  </Box>
                </Box>

                {/* Fake progress bar for shipment */}
                <Box sx={{ my: 2, position: 'relative' }}>
                  <LinearProgress
                    variant="determinate" value={65}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 3 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{liveShipment.pickup?.city}</Typography>
                    <Typography variant="caption" color="text.secondary">{liveShipment.delivery?.city}</Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth size="small" variant="outlined"
                  onClick={() => navigate(`/customer/orders/${liveShipment.orderid}`)}
                  sx={{ borderColor: textAccent, color: textAccent, fontWeight: 600 }}
                >
                  {t('myOrders.viewDetails')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
              <Button
                fullWidth variant="contained"
<<<<<<< HEAD
                sx={{ mb: 1.5, bgcolor: '#f59e0b', color: '#000', fontWeight: 600, py: 1.2, '&:hover': { bgcolor: '#d97706' } }}
=======
                sx={{ mb: 1.5, bgcolor: isDark ? '#2dd4bf' : '#f59e0b', color: '#000', fontWeight: 600, py: 1.2, '&:hover': { bgcolor: isDark ? '#14b8a6' : '#d97706' } }}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
                startIcon={<Plus size={18} />}
                onClick={() => navigate('/customer/orders/create')}
              >
                {t('customerDash.newOrder')}
              </Button>
              <TextField
                fullWidth size="small" placeholder="Track by Code"
                value={trackCode} onChange={(e) => setTrackCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} color="#94a3b8" /></InputAdornment> }}
                sx={{ mb: 1.5 }}
              />
              <Button
                fullWidth variant="outlined" startIcon={<Receipt size={16} />}
                onClick={() => navigate('/customer/invoices')}
                sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textAccent, fontWeight: 500 }}
              >
                {t('invoices.title')}
              </Button>
            </CardContent>
          </Card>

          {/* Spending Overview */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Spending</Typography>
                <Chip label={currentMonth} size="small" variant="outlined" />
              </Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: textAccent, mb: 0.5 }}>{formatCurrency(totalSpent)}</Typography>
              <Typography variant="caption" color="text.secondary">
                Across {allOrders.length} order{allOrders.length !== 1 ? 's' : ''} this month
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Avg. per order</Typography>
                <Typography variant="caption" fontWeight={600}>
                  {allOrders.length > 0 ? formatCurrency(totalSpent / allOrders.length) : 'PKR 0'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Most used mode</Typography>
                <Typography variant="caption" fontWeight={600}>Road</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
