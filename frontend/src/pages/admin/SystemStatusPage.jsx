import React from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Chip, useTheme } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/helpers';
import {
  Database, Users, Package, Truck, DollarSign, MapPin, Activity,
  CheckCircle, AlertTriangle, Clock, Server, Cpu, HardDrive
} from 'lucide-react';

function StatusCard({ title, icon: Icon, color, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </Box>
          <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, color, total, isDark }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" fontWeight={600}>{value}{total ? ` / ${total}` : ''}</Typography>
      </Box>
      {total > 0 && <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? '#1e293b' : '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color || '#3b82f6', borderRadius: 3 } }} />}
    </Box>
  );
}

export default function SystemStatusPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: status, loading } = useFetch('/admin/system-status');
  const d = status || {};

  const borderColor = isDark ? '#334155' : '#f1f5f9';
  const pendingColor = isDark ? '#2dd4bf' : '#f59e0b';
  const ordersIconColor = isDark ? '#2dd4bf' : '#f59e0b';
  const ratesColor = isDark ? '#2dd4bf' : '#f97316';

  const formatUptime = (seconds) => {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) return <Box><PageHeader title="System Status" subtitle="Loading..." /></Box>;

  return (
    <Box>
      <PageHeader title="System Status" subtitle="Real-time system health and database overview" />

      {/* API Health Banner */}
      <Card sx={{ mb: 3, bgcolor: d.api?.status === 'Operational' ? (isDark ? '#052e16' : '#f0fdf4') : (isDark ? '#3b1111' : '#fef2f2'), border: `1px solid ${d.api?.status === 'Operational' ? (isDark ? '#166534' : '#bbf7d0') : (isDark ? '#7f1d1d' : '#fecaca')}` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: d.api?.status === 'Operational' ? '#22c55e' : '#ef4444', animation: 'pulse 2s infinite' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>API Status: {d.api?.status || 'Unknown'}</Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#475569' }}>
                Uptime: {formatUptime(d.api?.uptime)} · Node {d.api?.nodeVersion}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip icon={<Cpu size={14} />} label={`Heap: ${formatBytes(d.api?.memory?.heapUsed)}`} size="small" sx={{ bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#f1f5f9' : undefined }} />
            <Chip icon={<HardDrive size={14} />} label={`RSS: ${formatBytes(d.api?.memory?.rss)}`} size="small" sx={{ bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: isDark ? '#f1f5f9' : undefined }} />
          </Box>
        </CardContent>
      </Card>

      {/* Database Record Counts */}
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: '#64748b' }}>DATABASE OVERVIEW</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Users', value: d.database?.users, icon: Users, color: '#3b82f6' },
          { label: 'Orders', value: d.database?.orders, icon: Package, color: ordersIconColor },
          { label: 'Shipments', value: d.database?.shipments, icon: Truck, color: '#10b981' },
          { label: 'Invoices', value: d.database?.invoices, icon: DollarSign, color: '#8b5cf6' },
          { label: 'Partners', value: d.database?.partners, icon: Truck, color: '#06b6d4' },
          { label: 'Locations', value: d.database?.locations, icon: MapPin, color: '#ec4899' },
          { label: 'Rates', value: d.database?.rates, icon: Activity, color: ratesColor },
          { label: 'Notifications', value: d.database?.notifications, icon: AlertTriangle, color: '#64748b' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={20} color={item.color} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>{item.value ?? '—'}</Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Detailed Breakdowns */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
        <StatusCard title="Users" icon={Users} color="#3b82f6">
          <StatRow label="Active" value={d.users?.active || 0} total={d.users?.total} color="#22c55e" isDark={isDark} />
          <StatRow label="Inactive" value={d.users?.inactive || 0} total={d.users?.total} color="#ef4444" isDark={isDark} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: `1px solid ${borderColor}` }}>
            <Typography variant="caption" color="text.secondary">Logins (24h)</Typography>
            <Chip label={d.users?.recentLogins || 0} size="small" sx={{ bgcolor: isDark ? '#1e3a5f' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: 600, height: 20 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">New this week</Typography>
            <Chip label={d.users?.newThisWeek || 0} size="small" sx={{ bgcolor: isDark ? '#052e16' : '#d1fae5', color: isDark ? '#6ee7b7' : '#047857', fontWeight: 600, height: 20 }} />
          </Box>
        </StatusCard>

        <StatusCard title="Orders Pipeline" icon={Package} color={ordersIconColor}>
          {Object.entries(d.orders?.byStatus || {}).map(([status, count]) => (
            <StatRow key={status} label={status} value={count} total={d.orders?.total} isDark={isDark} color={
              status === 'Completed' ? '#22c55e' : status === 'Pending' ? pendingColor : status === 'Cancelled' ? '#ef4444' : '#3b82f6'
            } />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: `1px solid ${borderColor}` }}>
            <Typography variant="caption" color="text.secondary">New this week</Typography>
            <Chip label={d.orders?.newThisWeek || 0} size="small" sx={{ bgcolor: isDark ? '#1a3a3a' : '#fef9c3', color: isDark ? '#2dd4bf' : '#a16207', fontWeight: 600, height: 20 }} />
          </Box>
        </StatusCard>

        <StatusCard title="Shipments" icon={Truck} color="#10b981">
          {Object.entries(d.shipments?.byStatus || {}).map(([status, count]) => (
            <StatRow key={status} label={status} value={count} total={d.shipments?.total} isDark={isDark} color={
              status === 'Delivered' ? '#22c55e' : status === 'In Transit' || status === 'InTransit' ? '#3b82f6' : status === 'Assigned' ? pendingColor : '#8b5cf6'
            } />
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: `1px solid ${borderColor}` }}>
            <Typography variant="caption" color="text.secondary">Delayed</Typography>
            <Chip label={d.shipments?.delayed || 0} size="small" sx={{ bgcolor: d.shipments?.delayed > 0 ? (isDark ? '#3b1111' : '#fee2e2') : (isDark ? '#052e16' : '#d1fae5'), color: d.shipments?.delayed > 0 ? (isDark ? '#fca5a5' : '#b91c1c') : (isDark ? '#6ee7b7' : '#047857'), fontWeight: 600, height: 20 }} />
          </Box>
        </StatusCard>

        <StatusCard title="Financials" icon={DollarSign} color="#8b5cf6">
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#6ee7b7' : '#047857' }}>{formatCurrency(d.financials?.totalRevenue)}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Pending Revenue</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: pendingColor }}>{formatCurrency(d.financials?.pendingRevenue)}</Typography>
          </Box>
          <StatRow label="Paid Invoices" value={d.financials?.paidInvoices || 0} total={d.financials?.totalInvoices} color="#22c55e" isDark={isDark} />
          <StatRow label="Pending Invoices" value={d.financials?.pendingInvoices || 0} total={d.financials?.totalInvoices} color={pendingColor} isDark={isDark} />
        </StatusCard>
      </Box>

      {/* Carrier Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
        <StatusCard title="Carrier Network" icon={Truck} color="#06b6d4">
          <StatRow label="Active Carriers" value={d.carriers?.active || 0} total={d.carriers?.total} color="#22c55e" isDark={isDark} />
          <StatRow label="Inactive Carriers" value={d.carriers?.inactive || 0} total={d.carriers?.total} color="#94a3b8" isDark={isDark} />
        </StatusCard>

        <StatusCard title="Server Info" icon={Server} color="#64748b">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Chip icon={<CheckCircle size={12} />} label="Operational" size="small" sx={{ bgcolor: isDark ? '#052e16' : '#d1fae5', color: isDark ? '#6ee7b7' : '#047857', fontWeight: 600, height: 22 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Uptime</Typography>
            <Typography variant="caption" fontWeight={600}>{formatUptime(d.api?.uptime)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Node Version</Typography>
            <Typography variant="caption" fontWeight={600}>{d.api?.nodeVersion}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Heap Used</Typography>
            <Typography variant="caption" fontWeight={600}>{formatBytes(d.api?.memory?.heapUsed)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">RSS Memory</Typography>
            <Typography variant="caption" fontWeight={600}>{formatBytes(d.api?.memory?.rss)}</Typography>
          </Box>
        </StatusCard>
      </Box>
    </Box>
  );
}
