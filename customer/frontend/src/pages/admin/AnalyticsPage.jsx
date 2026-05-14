import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Package, TrendingUp, Truck, DollarSign } from 'lucide-react';

const formatMonth = (m) => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(mo) - 1]} ${y.slice(2)}`;
};

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', borderRadius: 1, p: 1.5, boxShadow: 2 }}>
      <Typography variant="caption" fontWeight={600}>{formatMonth(label)}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" display="block" sx={{ color: p.color }}>
          {p.name}: {isCurrency ? formatCurrency(p.value) : p.value}
        </Typography>
      ))}
    </Box>
  );
};

export default function AnalyticsPage() {
  const { data: volumeData } = useFetch('/analytics/shipment-volume');
  const { data: routes } = useFetch('/analytics/routes');
  const { data: carrierPerf } = useFetch('/analytics/carrier-performance');

  const chartData = (volumeData || []).map((d) => ({ ...d, monthLabel: formatMonth(d.month) }));

  // KPI summaries
  const totalShipments = chartData.reduce((s, d) => s + d.count, 0);
  const totalCompleted = chartData.reduce((s, d) => s + (d.completed || 0), 0);
  const totalRevenue = chartData.reduce((s, d) => s + (d.revenue || 0), 0);
  const completionRate = totalShipments > 0 ? Math.round((totalCompleted / totalShipments) * 100) : 0;

  const routeColumns = [
    { id: 'route', label: 'Route' },
    { id: 'totalShipments', label: 'Total Shipments' },
    { id: 'onTimePercent', label: 'On-Time %', render: (r) => `${r.onTimePercent}%` }
  ];

  const carrierColumns = [
    { id: 'companyName', label: 'Carrier' },
    { id: 'totalShipments', label: 'Shipments' },
    { id: 'onTimePercent', label: 'On-Time %', render: (r) => `${r.onTimePercent}%` },
    { id: 'rating', label: 'Avg Rating', render: (r) => `${r.rating}/5` },
    { id: 'delayedCount', label: 'Delayed' }
  ];

  return (
    <Box>
      <PageHeader title="Analytics & Reports" subtitle="Comprehensive business intelligence" />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        <StatCard title="Total Shipments" value={totalShipments} icon={Package} color="#1a3a4a" />
        <StatCard title="Completed" value={totalCompleted} icon={Truck} color="#10b981" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} color="#3b82f6" />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} color="#f59e0b" />
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Shipment Volume</Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" name="Total" fill="#1a3a4a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No shipment data available yet. Charts will populate as orders are completed.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Revenue Trend</Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip isCurrency />} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No revenue data available yet. Revenue will appear after invoices are paid.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Top Routes</Typography>
          <DataTable columns={routeColumns} rows={routes || []} emptyMessage="No route data" />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Carrier Performance</Typography>
          <DataTable columns={carrierColumns} rows={carrierPerf || []} emptyMessage="No carrier data" />
        </Box>
      </Box>
    </Box>
  );
}
