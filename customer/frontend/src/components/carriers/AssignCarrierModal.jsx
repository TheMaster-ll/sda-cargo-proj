import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Card, CardContent, Rating, Divider, CircularProgress, Chip, IconButton } from '@mui/material';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { X, Star, Clock, Truck, CheckCircle, Copy } from 'lucide-react';

export default function AssignCarrierModal({ orderId, open, onClose }) {
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);

  useEffect(() => {
    if (open && orderId) {
      loadCarriers();
    }
  }, [open, orderId]);

  const loadCarriers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}/carriers`);
      if (data.success) setCarriers(data.data);
    } catch {
      toast.error('Failed to load available carriers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      const { data } = await api.post(`/orders/${orderId}/assign-carrier`, {
        partnerId: selected.partnerId,
        rateId: selected.rateId
      });
      if (data.success) {
        setAssignResult(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign carrier');
    } finally {
      setAssigning(false);
    }
  };

  const cheapest = carriers.length > 0 ? carriers.reduce((min, c) => c.total < min.total ? c : min, carriers[0]) : null;
  const fastest = carriers.length > 0 ? carriers.reduce((min, c) => (c.transitDays || 99) < (min.transitDays || 99) ? c : min, carriers[0]) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Select & Assign Carrier</Typography>
            <Typography variant="caption" color="text.secondary">ORD-{orderId}</Typography>
          </Box>
          <IconButton onClick={onClose}><X size={20} /></IconButton>
        </Box>

        {assignResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, px: 4 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <CheckCircle size={32} color="#047857" />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>Carrier Assigned Successfully</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {selected?.companyName} has been assigned. The customer will be notified.
            </Typography>

            <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Tracking Code</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace', letterSpacing: 2, color: '#1a3a4a' }}>
                    {assignResult.trackingCode}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(assignResult.trackingCode);
                      toast.success('Tracking code copied!');
                    }}
                    sx={{ color: '#64748b' }}
                  >
                    <Copy size={18} />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Shipment: {assignResult.shipmentNumber}
                </Typography>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              onClick={() => { setAssignResult(null); onClose(); }}
              sx={{ bgcolor: '#1a3a4a', px: 4 }}
            >
              Done
            </Button>
          </Box>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'flex', p: 3, gap: 3 }}>
            <Box sx={{ flex: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>Available Carriers ({carriers.length})</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {carriers.map((c) => (
                  <Card
                    key={c.partnerId}
                    onClick={() => setSelected(c)}
                    sx={{
                      cursor: 'pointer',
                      border: selected?.partnerId === c.partnerId ? '2px solid #1a3a4a' : '1px solid #e2e8f0',
                      '&:hover': { borderColor: '#1a3a4a' }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#1a3a4a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                            {c.companyName?.[0]}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{c.companyName}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                              <Star size={12} color="#f59e0b" fill="#f59e0b" />
                              <Typography variant="caption">{c.rating} ({c.totalShipments} trips)</Typography>
                            </Box>
                          </Box>
                        </Box>
                        {cheapest?.partnerId === c.partnerId && <Chip label="Best Value" size="small" sx={{ bgcolor: '#d1fae5', color: '#047857', fontWeight: 600, fontSize: '0.65rem' }} />}
                        {fastest?.partnerId === c.partnerId && cheapest?.partnerId !== c.partnerId && <Chip label="Fastest" size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 600, fontSize: '0.65rem' }} />}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Truck size={14} />
                          <Typography variant="caption">{c.serviceType || c.transportMode}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={14} />
                          <Typography variant="caption">{c.transitDays ? `${c.transitDays} Days` : 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Base Freight</Typography>
                        <Typography variant="caption">{formatCurrency(c.baseRate)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Surcharges & Tax</Typography>
                        <Typography variant="caption">{formatCurrency(c.fuelSurcharge)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(c.total)}</Typography>
                        {selected?.partnerId === c.partnerId ? (
                          <Chip label="Selected ✓" size="small" sx={{ bgcolor: '#1a3a4a', color: '#fff' }} />
                        ) : (
                          <Button size="small" variant="outlined">Select Carrier</Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              {carriers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No carriers available for this route and weight.
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card sx={{ bgcolor: '#f8fafc' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Assignment Summary</Typography>
                  {selected ? (
                    <>
                      <Box sx={{ bgcolor: '#fff', p: 1.5, borderRadius: 1, border: '1px solid #e2e8f0', mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>{selected.companyName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selected.serviceType} | {selected.transitDays} Days
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Base Rate</Typography>
                        <Typography variant="body2">{formatCurrency(selected.baseRate)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Fuel Surcharge</Typography>
                        <Typography variant="body2">{formatCurrency(selected.fuelSurcharge)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Weight Charge</Typography>
                        <Typography variant="body2">{formatCurrency(selected.weightCharge)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>Estimated Total</Typography>
                        <Typography variant="h6" fontWeight={700} color="primary">{formatCurrency(selected.total)}</Typography>
                      </Box>
                      <Button
                        fullWidth variant="contained"
                        onClick={handleAssign} disabled={assigning}
                        sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' }, py: 1.2 }}
                      >
                        {assigning ? <CircularProgress size={22} /> : 'Confirm Assignment ✓'}
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Select a carrier to see summary</Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
