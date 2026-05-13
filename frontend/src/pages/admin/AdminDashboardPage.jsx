import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Chip, useTheme, Collapse, IconButton, TextField, MenuItem, Divider } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import api from '../../services/api';
import { Package, DollarSign, Truck, Users, ClipboardList, AlertTriangle, LogIn, Shield, User, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const ACTION_ICONS = {
  'Login': LogIn,
  'Role Change': Shield,
  'User Activated': User,
  'User Deactivated': User,
  'Shipment Status Update': Truck,
  'Carrier Assigned': Package,
};

const ACTION_COLORS = {
  'Login': '#3b82f6',
  'Role Change': '#a21caf',
  'User Activated': '#10b981',
  'User Deactivated': '#ef4444',
  'Shipment Status Update': '#f59e0b',
  'Carrier Assigned': '#4338ca',
};

const AUDIT_COLORS_LIGHT = {
  'Login': { bg: '#dbeafe', color: '#1d4ed8' },
  'Role Change': { bg: '#fae8ff', color: '#a21caf' },
  'User Activated': { bg: '#d1fae5', color: '#047857' },
  'User Deactivated': { bg: '#fee2e2', color: '#b91c1c' },
  'Shipment Status Update': { bg: '#fef9c3', color: '#a16207' },
  'Carrier Assigned': { bg: '#e0e7ff', color: '#4338ca' },
  'Carrier Update': { bg: '#ffedd5', color: '#c2410c' },
};
const AUDIT_COLORS_DARK = {
  'Login': { bg: '#1e3a5f', color: '#60a5fa' },
  'Role Change': { bg: '#3b1854', color: '#e879f9' },
  'User Activated': { bg: '#052e16', color: '#6ee7b7' },
  'User Deactivated': { bg: '#3b1111', color: '#fca5a5' },
  'Shipment Status Update': { bg: '#3b2f08', color: '#fbbf24' },
  'Carrier Assigned': { bg: '#1e1b4b', color: '#a5b4fc' },
  'Carrier Update': { bg: '#3b1a08', color: '#fb923c' },
};

export default function AdminDashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const c = theme.palette.custom;

  const PIE_COLORS = [isDark ? '#1a7a7a' : '#1a3a4a', isDark ? '#2dd4bf' : '#f59e0b', '#06b6d4'];

  const { data: dashboard } = useFetch('/analytics/dashboard');
  const { data: volumeData } = useFetch('/analytics/shipment-volume');
  const { data: transportBreakdown } = useFetch('/admin/transport-breakdown');

  const d = dashboard || {};
  const pieData = (transportBreakdown && transportBreakdown.length > 0 && !transportBreakdown.every((p) => p.value === 0))
    ? transportBreakdown
    : [{ name: 'Air', value: 42 }, { name: 'Road', value: 85 }, { name: 'Sea', value: 31 }];

  // Audit log state
  const [auditOpen, setAuditOpen] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPagination, setAuditPagination] = useState({ total: 0, pages: 1 });
  const [auditFilter, setAuditFilter] = useState('');
  const AUDIT_COLORS = isDark ? AUDIT_COLORS_DARK : AUDIT_COLORS_LIGHT;
  const DEFAULT_AUDIT = isDark ? { bg: '#1e293b', color: '#94a3b8' } : { bg: '#f1f5f9', color: '#475569' };

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({ page: auditPage, limit: 15 });
      if (auditFilter) params.append('action', auditFilter);
      const { data } = await api.get(`/admin/audit?${params}`);
      if (data.success) {
        setAuditLogs(data.data);
        setAuditPagination(data.pagination);
      }
    } catch { setAuditLogs([]); }
    finally { setAuditLoading(false); }
  }, [auditPage, auditFilter]);

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const formatDetails = (log) => {
    if (!log.details) return null;
    const det = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
    if (det.from && det.to) return `${det.from} → ${det.to}`;
    if (det.newRole) return `New role: ${det.newRole}`;
    if (det.trackingCode) return `Tracking: ${det.trackingCode}`;
    if (det.role) return det.role;
    return null;
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box sx={{ bgcolor: isDark ? '#1e293b' : '#fff', p: 1.5, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{label}</Typography>
        {payload.map((p) => (
          <Typography key={p.name} variant="body2" sx={{ color: p.color }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Left Column — Main Dashboard */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>System Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Real-time administrator metrics and system health.</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard title="Total Users" value={d.totalUsers || 0} icon={Users} color="#3b82f6" />
        <StatCard title="Total Orders" value={d.totalOrders || 0} icon={Package} color={isDark ? '#1a7a7a' : '#1a3a4a'} />
        <StatCard title="Active Carriers" value={d.activeCarriers || 0} icon={Truck} color="#10b981" />
        <StatCard title="In Transit" value={d.inTransitShipments || 0} icon={ClipboardList} color={isDark ? '#2dd4bf' : '#f59e0b'} />
        <StatCard title="Revenue" value={formatCurrency(d.totalRevenue)} icon={DollarSign} color={isDark ? '#1a7a7a' : '#1a3a4a'} />
      </Box>

      {d.delayedShipments > 0 && (
        <Card sx={{ mb: 3, bgcolor: isDark ? '#3b1111' : '#fef2f2', border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}` }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
            <AlertTriangle size={20} color="#ef4444" />
            <Typography variant="body2" fontWeight={600} sx={{ color: '#ef4444' }}>
              {d.delayedShipments} delayed shipment{d.delayedShipments > 1 ? 's' : ''} · {d.overdueInvoices || 0} overdue invoice{(d.overdueInvoices || 0) !== 1 ? 's' : ''}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Shipments Over Time</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={volumeData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
              <Bar dataKey="count" name="Total" fill={isDark ? '#1a7a7a' : '#1a3a4a'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Competitor Comparison Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>Competitive Analysis</Typography>
        <Chip label="vs Top Competitors" size="small" sx={{ bgcolor: isDark ? '#1e293b' : '#f1f5f9', color: 'text.secondary', fontWeight: 500, fontSize: '0.7rem' }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>Revenue vs Competitors</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>Quarterly revenue comparison (in thousands $) — FreightHub & ShipFast are top industry competitors</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={[
                { quarter: 'Q1 2025', CargoPort: 120, FreightHub: 185, ShipFast: 95 },
                { quarter: 'Q2 2025', CargoPort: 155, FreightHub: 190, ShipFast: 110 },
                { quarter: 'Q3 2025', CargoPort: 210, FreightHub: 200, ShipFast: 125 },
                { quarter: 'Q4 2025', CargoPort: 280, FreightHub: 215, ShipFast: 140 },
                { quarter: 'Q1 2026', CargoPort: 340, FreightHub: 225, ShipFast: 150 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} tickFormatter={(v) => `$${v}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                <Line type="monotone" dataKey="CargoPort" stroke={isDark ? '#2dd4bf' : '#1a3a4a'} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="FreightHub" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ShipFast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>Performance Comparison</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Key logistics metrics scored out of 100</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: isDark ? '#2dd4bf' : '#1a3a4a' }} />
                <Typography variant="caption" fontWeight={600}>CargoPort</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                <Typography variant="caption" color="text.secondary">FreightHub</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <Typography variant="caption" color="text.secondary">ShipFast</Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                { metric: 'On-Time', CargoPort: 92, FreightHub: 85, ShipFast: 78 },
                { metric: 'Pricing', CargoPort: 80, FreightHub: 70, ShipFast: 88 },
                { metric: 'Coverage', CargoPort: 75, FreightHub: 90, ShipFast: 65 },
                { metric: 'Support', CargoPort: 95, FreightHub: 72, ShipFast: 70 },
                { metric: 'Tech', CargoPort: 88, FreightHub: 80, ShipFast: 60 },
                { metric: 'Growth', CargoPort: 90, FreightHub: 65, ShipFast: 72 },
              ]}>
                <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="CargoPort" dataKey="CargoPort" stroke={isDark ? '#2dd4bf' : '#1a3a4a'} fill={isDark ? '#2dd4bf' : '#1a3a4a'} fillOpacity={0.25} strokeWidth={2} />
                <Radar name="FreightHub" dataKey="FreightHub" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="ShipFast" dataKey="ShipFast" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Competitor Shipment Volume Comparison */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>Monthly Shipment Volume Comparison</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>Total shipments handled per month vs competitors</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={[
              { month: 'Nov', CargoPort: 145, FreightHub: 210, ShipFast: 98 },
              { month: 'Dec', CargoPort: 168, FreightHub: 220, ShipFast: 105 },
              { month: 'Jan', CargoPort: 195, FreightHub: 215, ShipFast: 112 },
              { month: 'Feb', CargoPort: 230, FreightHub: 225, ShipFast: 118 },
              { month: 'Mar', CargoPort: 275, FreightHub: 230, ShipFast: 125 },
              { month: 'Apr', CargoPort: 310, FreightHub: 235, ShipFast: 130 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
              <Bar dataKey="CargoPort" fill={isDark ? '#1a7a7a' : '#1a3a4a'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="FreightHub" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.7} />
              <Bar dataKey="ShipFast" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Shipments by Transport Mode</Typography>
          {pieData.length === 0 || pieData.every((p) => p.value === 0) ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No shipment data available yet
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, color: isDark ? '#f1f5f9' : '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
              <Box>
                {pieData.map((item, i) => {
                  const total = pieData.reduce((s, p) => s + p.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <Typography variant="body2">{item.name}</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ ml: 2 }}>{item.value} ({pct}%)</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      </Box>

      {/* Right Column — Audit Log Panel */}
      <Box sx={{ width: 340, flexShrink: 0 }}>
        <Card sx={{ position: 'sticky', top: 16 }}>
          <CardContent sx={{ pb: auditOpen ? 1 : undefined }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setAuditOpen(!auditOpen)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClipboardList size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                <Typography variant="subtitle1" fontWeight={600}>Audit Log</Typography>
                {auditPagination.total > 0 && (
                  <Chip label={auditPagination.total} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: isDark ? '#1e293b' : '#f1f5f9' }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); fetchAuditLogs(); }} sx={{ width: 28, height: 28 }}>
                  <RefreshCw size={14} />
                </IconButton>
                {auditOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Box>
            </Box>
          </CardContent>

          <Collapse in={auditOpen}>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <TextField
                select size="small" fullWidth label="Filter" value={auditFilter}
                onChange={(e) => { setAuditFilter(e.target.value); setAuditPage(1); }}
                sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem' } }}
              >
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="Login">Login</MenuItem>
                <MenuItem value="Role Change">Role Change</MenuItem>
                <MenuItem value="User Activated">User Activated</MenuItem>
                <MenuItem value="User Deactivated">User Deactivated</MenuItem>
                <MenuItem value="Shipment Status Update">Shipment Update</MenuItem>
                <MenuItem value="Carrier Assigned">Carrier Assigned</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ maxHeight: 520, overflowY: 'auto', px: 0 }}>
              {auditLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>Loading...</Typography>
              ) : auditLogs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                  <ClipboardList size={32} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: 6 }} />
                  <Typography variant="body2" color="text.secondary">No audit logs found</Typography>
                </Box>
              ) : (
                auditLogs.map((log, i) => {
                  const style = AUDIT_COLORS[log.action] || DEFAULT_AUDIT;
                  const Icon = ACTION_ICONS[log.action] || ClipboardList;
                  const details = formatDetails(log);
                  return (
                    <Box
                      key={log.logid}
                      sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.2,
                        borderBottom: i < auditLogs.length - 1 ? `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}` : 'none',
                        '&:hover': { bgcolor: isDark ? '#1e293b' : '#fafbfc' }
                      }}
                    >
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', bgcolor: style.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.2
                      }}>
                        <Icon size={13} color={style.color} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.78rem' }}>
                            {log.users ? `${log.users.firstname} ${log.users.lastname}` : 'System'}
                          </Typography>
                          <Chip label={log.action} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.6rem', height: 18 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                          {log.entitytype && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              {log.entitytype} #{log.entityid}
                            </Typography>
                          )}
                          {details && (
                            <Typography variant="caption" sx={{ color: style.color, fontWeight: 500, fontSize: '0.68rem' }}>
                              {details}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                          {getTimeAgo(log.createdat)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>

            {auditPagination.pages > 1 && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1 }}>
                  <IconButton disabled={auditPage <= 1} onClick={() => setAuditPage(auditPage - 1)} size="small">
                    <ChevronLeft size={16} />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary">
                    {auditPage} / {auditPagination.pages}
                  </Typography>
                  <IconButton disabled={auditPage >= auditPagination.pages} onClick={() => setAuditPage(auditPage + 1)} size="small">
                    <ChevronRight size={16} />
                  </IconButton>
                </Box>
              </>
            )}
          </Collapse>
        </Card>
      </Box>
    </Box>
  );
}
