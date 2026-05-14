import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Chip, Typography, Card, CardContent, InputAdornment, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const statusFilters = ['', 'Pending', 'Assigned', 'In Transit', 'Completed', 'Cancelled'];

export default function MyOrdersPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textAccent = isDark ? '#e2e8f0' : '#1a3a4a';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders, loading, refetch } = useFetch('/orders/my');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allOrders = orders || [];
  const filtered = allOrders.filter((o) => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSearch = !searchQuery ||
      o.ordernumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.pickup?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.delivery?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCancel = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success(t('myOrders.orderCancelled'));
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  // Tab counts
  const counts = {
    '': allOrders.length,
    'Pending': allOrders.filter(o => o.status === 'Pending').length,
    'Assigned': allOrders.filter(o => o.status === 'Assigned').length,
    'In Transit': allOrders.filter(o => ['In Transit', 'InTransit'].includes(o.status) || o.shipments?.some(s => ['In Transit', 'InTransit'].includes(s.status))).length,
    'Completed': allOrders.filter(o => o.status === 'Completed').length,
    'Cancelled': allOrders.filter(o => o.status === 'Cancelled').length
  };

  const columns = [
    {
      id: 'ordernumber', label: t('myOrders.orderNumber'),
      render: (r) => <Typography variant="body2" fontWeight={600} sx={{ color: textAccent }}>{r.ordernumber}</Typography>
    },
    {
      id: 'route', label: t('myOrders.route'),
      render: (r) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2">{r.pickup?.city || '—'}</Typography>
          <ArrowRight size={12} color="#94a3b8" />
          <Typography variant="body2">{r.delivery?.city || '—'}</Typography>
        </Box>
      )
    },
    { id: 'totalweight', label: t('myOrders.weight'), render: (r) => r.totalweight ? `${r.totalweight} kg` : '-' },
    { id: 'estimatedcost', label: t('myOrders.cost'), render: (r) => r.estimatedcost ? formatCurrency(r.estimatedcost) : '-' },
    { id: 'tracking', label: t('tracking.trackingCode'), render: (r) => r.shipments?.[0]?.trackingcode ? (
      <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: isDark ? '#1e293b' : '#f0f9ff', px: 1, py: 0.3, borderRadius: 1, color: textAccent, fontWeight: 600 }}>
        {r.shipments[0].trackingcode}
      </Typography>
    ) : <Typography variant="caption" color="text.secondary">—</Typography> },
    { id: 'createdat', label: t('myOrders.date'), render: (r) => formatDate(r.createdat) },
    { id: 'status', label: t('myOrders.status'), render: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions', label: '', sortable: false,
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small" variant="outlined"
            onClick={(e) => { e.stopPropagation(); navigate(`/customer/orders/${r.orderid}`); }}
            sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: textAccent, fontSize: '0.75rem' }}
          >
            {t('myOrders.viewDetails')}
          </Button>
          {r.status === 'Pending' && (
            <Button
              size="small" variant="outlined" color="error"
              onClick={(e) => { e.stopPropagation(); handleCancel(r.orderid); }}
              sx={{ fontSize: '0.75rem' }}
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title={t('myOrders.title')}
        subtitle={t('myOrders.subtitle')}
        action={
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/customer/orders/create')}
<<<<<<< HEAD
            sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 600, '&:hover': { bgcolor: '#d97706' } }}
=======
            sx={{ bgcolor: isDark ? '#2dd4bf' : '#f59e0b', color: '#000', fontWeight: 600, '&:hover': { bgcolor: isDark ? '#14b8a6' : '#d97706' } }}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
          >
            {t('customerDash.newOrder')}
          </Button>
        }
      />

      {/* Status filter tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {statusFilters.map((s) => {
          const label = s || 'All';
          const count = counts[s] || 0;
          const isActive = statusFilter === s;
          return (
            <Chip
              key={label}
              label={`${label} ${count}`}
              onClick={() => setStatusFilter(s)}
              sx={{
                fontWeight: isActive ? 700 : 500,
                bgcolor: isActive ? (isDark ? '#2dd4bf' : '#1a3a4a') : (isDark ? '#334155' : '#f1f5f9'),
                color: isActive ? '#fff' : '#475569',
                '&:hover': { bgcolor: isActive ? (isDark ? '#2dd4bf' : '#1a3a4a') : (isDark ? '#475569' : '#e2e8f0') },
                fontSize: '0.8rem'
              }}
            />
          );
        })}
      </Box>

      {/* Search bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search Order #, Origin, Destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={16} color="#94a3b8" /></InputAdornment>
          }}
          sx={{ flex: 1, maxWidth: 400 }}
        />
      </Box>

      <DataTable
        columns={columns}
        rows={filtered}
        onRowClick={(r) => navigate(`/customer/orders/${r.orderid}`)}
        emptyMessage="No orders found"
      />

      {/* Results count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {filtered.length} of {allOrders.length} orders
        </Typography>
      </Box>
    </Box>
  );
}
