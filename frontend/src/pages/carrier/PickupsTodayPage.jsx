import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

export default function PickupsTodayPage() {
  const { data: shipments, refetch } = useFetch('/shipments/my');

  const todaysPickups = (shipments || []).filter((s) => s.status === 'Assigned');

  const handlePickup = async (shipmentId) => {
    try {
      await api.put(`/shipments/${shipmentId}/status`, { status: 'Picked Up' });
      toast.success('Marked as Picked Up');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <Box>
      <PageHeader title="Pickups Today" subtitle="Shipments scheduled for pickup today" />

      {todaysPickups.length === 0 ? (
        <Card><CardContent><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No pickups scheduled for today</Typography></CardContent></Card>
      ) : (
        todaysPickups.map((s) => (
          <Card key={s.shipmentid} sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color="#f59e0b" />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    {s.shipmentnumber} <StatusBadge status={s.status} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.orders?.pickup?.locationname || s.orders?.pickup?.city || 'N/A'} | {s.orders?.totalweight}kg
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.orders?.totalpieces} items | {s.orders?.commodity || 'General Cargo'}
                  </Typography>
                </Box>
              </Box>
              <Button variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={() => handlePickup(s.shipmentid)}>
                Mark Picked Up
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
