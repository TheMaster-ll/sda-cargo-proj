import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, MenuItem, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DollarSign, TrendingUp, Truck, CheckCircle } from 'lucide-react';

export default function EarningsPage() {
  const { data: shipments } = useFetch('/shipments/my');
  const [period, setPeriod] = useState('all');

  const all = shipments || [];

  // Filter by period
  const now = new Date();
  const filtered = all.filter((s) => {
    if (period === 'all') return true;
    const date = new Date(s.createdat);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter') {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return date >= qStart;
    }
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });

  const delivered = filtered.filter((s) => s.status === 'Delivered');
  const inProgress = filtered.filter((s) => !['Delivered', 'Cancelled'].includes(s.status));

  const totalEarned = delivered.reduce((sum, s) => sum + Number(s.totalcost || 0), 0);
  const pendingEarnings = inProgress.reduce((sum, s) => sum + Number(s.totalcost || 0), 0);
  const thisMonth = all
    .filter((s) => s.status === 'Delivered' && new Date(s.actualdelivery || s.createdat).getMonth() === now.getMonth() && new Date(s.actualdelivery || s.createdat).getFullYear() === now.getFullYear())
    .reduce((sum, s) => sum + Number(s.totalcost || 0), 0);

  // Monthly chart data
  const monthlyMap = {};
  all.forEach((s) => {
    if (s.status === 'Delivered') {
      const d = new Date(s.actualdelivery || s.createdat);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, earned: 0, trips: 0 };
      monthlyMap[key].earned += Number(s.totalcost || 0);
      monthlyMap[key].trips += 1;
    }
  });
  const chartData = Object.values(monthlyMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((m) => ({
      ...m,
      label: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box sx={{ bgcolor: '#fff', p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {payload.map((p) => (
          <Typography key={p.name} variant="body2" sx={{ color: p.color }}>
            {p.name}: {p.name === 'earned' ? formatCurrency(p.value) : p.value}
          </Typography>
        ))}
      </Box>
    );
  };

  // Table columns
  const columns = [
    { id: 'shipmentnumber', label: 'Shipment #', render: (r) => (
      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{r.shipmentnumber}</Typography>
    )},
    { id: 'route', label: 'Route', render: (r) => `${r.orders?.pickup?.city || '?'} → ${r.orders?.delivery?.city || '?'}` },
    { id: 'customer', label: 'Customer', render: (r) => r.orders?.companies?.companyname || '-' },
    { id: 'totalcost', label: 'Amount', render: (r) => (
      <Typography variant="body2" fontWeight={600} sx={{ color: '#047857' }}>{formatCurrency(r.totalcost)}</Typography>
    )},
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { id: 'payment', label: 'Payment', sortable: false, render: (r) => (
      <Chip
        size="small"
        label={r.status === 'Delivered' ? 'Earned' : 'Pending'}
        sx={{
          bgcolor: r.status === 'Delivered' ? '#d1fae5' : '#fef9c3',
          color: r.status === 'Delivered' ? '#047857' : '#a16207',
          fontWeight: 600, fontSize: '0.75rem'
        }}
      />
    )},
    { id: 'date', label: 'Date', render: (r) => formatDate(r.actualdelivery || r.createdat) },
  ];

  return (
    <Box>
      <PageHeader title="Earnings" subtitle="Track your revenue and payment history" />

      {/* Period Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField select size="small" label="Period" value={period} onChange={(e) => setPeriod(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
          <MenuItem value="quarter">This Quarter</MenuItem>
          <MenuItem value="year">This Year</MenuItem>
        </TextField>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard title="Total Earned" value={formatCurrency(totalEarned)} icon={DollarSign} color="#10b981" />
        <StatCard title="Pending Earnings" value={formatCurrency(pendingEarnings)} icon={TrendingUp} color="#f59e0b" />
        <StatCard title="This Month" value={formatCurrency(thisMonth)} icon={CheckCircle} color="#3b82f6" />
        <StatCard title="Completed Trips" value={delivered.length} icon={Truck} color="#8b5cf6" />
      </Box>

      {/* Monthly Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Monthly Earnings</Typography>
          {chartData.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No earnings data yet. Complete shipments to see your earnings chart.
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="earned" name="Earnings (PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="trips" name="Trips" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Earnings Table */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Earnings Breakdown</Typography>
          <DataTable columns={columns} rows={filtered} emptyMessage="No shipments found for this period" />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Showing {filtered.length} shipments · {delivered.length} completed · {inProgress.length} in progress
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
