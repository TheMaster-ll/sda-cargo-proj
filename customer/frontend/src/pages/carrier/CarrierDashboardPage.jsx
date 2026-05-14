import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { Truck, Package, CheckCircle, Target } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CarrierDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { data: shipments, refetch } = useFetch('/shipments/my');

  const all = shipments || [];
  const active = all.filter((s) => !['Delivered', 'Cancelled'].includes(s.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const pickupsToday = all.filter((s) => s.scheduledpickup?.slice(0, 10) === today && s.status === 'Assigned').length;
  const completedWeek = all.filter((s) => {
    if (s.status !== 'Delivered') return false;
    const d = new Date(s.actualdelivery || s.createdat);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const delivered = all.filter((s) => s.status === 'Delivered').length;
  const onTimeRate = all.length > 0 ? Math.round((delivered / Math.max(all.length, 1)) * 100) : 95;

  const todaysPickups = all.filter((s) => s.status === 'Assigned').slice(0, 3);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Overview of today's logistics operations.</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard title="Active Assignments" value={active} icon={Truck} color={isDark ? '#2dd4bf' : '#1a3a4a'} />
        <StatCard title="Today's Pickups" value={pickupsToday} icon={Package} color="#f59e0b" />
        <StatCard title="Completed This Week" value={completedWeek} icon={CheckCircle} color="#10b981" />
        <StatCard title="On-Time Rate" value={`${onTimeRate}%`} icon={Target} color="#10b981" />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Today's Pickups</Typography>
              <Button size="small" onClick={() => navigate('/carrier/pickups')}>View All</Button>
            </Box>
            {todaysPickups.map((s) => (
              <Box key={s.shipmentid} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={18} color="#f59e0b" />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{s.shipmentnumber} <StatusBadge status={s.status} /></Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.orders?.pickup?.city || 'N/A'} | {s.orders?.totalweight}kg
                    </Typography>
                  </Box>
                </Box>
                <Button size="small" variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={() => navigate(`/carrier/shipments/${s.shipmentid}`)}>
                  Mark Picked Up
                </Button>
              </Box>
            ))}
            {todaysPickups.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No pickups scheduled</Typography>}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Performance</Typography>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" fontWeight={700} color="primary">{onTimeRate}%</Typography>
              <Typography variant="body2" color="text.secondary">On-Time Rate</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">vs last month:</Typography>
              <Typography variant="caption" color="text.secondary">Target: 92%</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
