import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

const VALID_NEXT = {
  Assigned: ['Picked Up'],
  'Picked Up': ['In Transit'],
  PickedUp: ['In Transit'],
  'In Transit': ['Delivered'],
  InTransit: ['Delivered']
};

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { data: shipments, refetch } = useFetch('/shipments');
  const [statusFilter, setStatusFilter] = useState('');
  const [updateModal, setUpdateModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const filtered = statusFilter ? (shipments || []).filter((s) => s.status === statusFilter) : (shipments || []);

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/shipments/${updateModal.shipmentid}/status`, { status: newStatus, note });
      toast.success(`Status updated to ${newStatus}`);
      const shipmentForRating = updateModal;
      setUpdateModal(null);
      refetch();
      // Prompt rating when marking as Delivered
      if (newStatus === 'Delivered') {
        setRatingModal(shipmentForRating);
        setRatingValue(0);
        setRatingComment('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingValue) return toast.error('Please select a rating');
    try {
      await api.post(`/ratings/${ratingModal.shipmentid}`, { rating: ratingValue, comment: ratingComment });
      toast.success('Carrier rated successfully!');
      setRatingModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const columns = [
    { id: 'shipmentnumber', label: 'Shipment #' },
    { id: 'order', label: 'Order #', render: (r) => r.orders?.ordernumber || '-' },
    { id: 'customer', label: 'Customer', render: (r) => r.orders?.companies?.companyname || '-' },
    { id: 'carrier', label: 'Carrier', render: (r) => r.partners?.companyname || '-' },
    { id: 'route', label: 'Route', render: (r) => `${r.orders?.pickup?.city || '?'} → ${r.orders?.delivery?.city || '?'}` },
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { id: 'estimateddelivery', label: 'Est. Delivery', render: (r) => formatDate(r.estimateddelivery) },
    { id: 'delayed', label: 'Delayed', render: (r) => r.isdelayed ? '⚠️' : '-' },
    {
      id: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/dispatcher/shipments/${r.shipmentid}`); }}>View</Button>
          {VALID_NEXT[r.status] && (
            <Button size="small" variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={(e) => { e.stopPropagation(); setUpdateModal(r); setNewStatus(VALID_NEXT[r.status][0]); }}>
              Update
            </Button>
          )}
          {r.status === 'Delivered' && (
            <Button size="small" variant="outlined" startIcon={<Star size={14} />} onClick={(e) => { e.stopPropagation(); setRatingModal(r); setRatingValue(0); setRatingComment(''); }} sx={{ borderColor: '#f59e0b', color: '#92400e' }}>
              Rate
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="Shipments" subtitle="Track and manage all shipments" />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Assigned">Assigned</MenuItem>
          <MenuItem value="Picked Up">Picked Up</MenuItem>
          <MenuItem value="In Transit">In Transit</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </TextField>
      </Box>
      <DataTable columns={columns} rows={filtered} emptyMessage="No shipments found" />

      <Dialog open={!!updateModal} onClose={() => setUpdateModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Shipment Status</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="New Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ mt: 1, mb: 2 }}>
            {updateModal && (VALID_NEXT[updateModal.status] || []).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField fullWidth multiline rows={2} label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateModal(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateStatus} sx={{ bgcolor: '#1a3a4a' }}>Confirm Update</Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={!!ratingModal} onClose={() => setRatingModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rate Carrier</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Rate <strong>{ratingModal?.partners?.companyname}</strong> for shipment {ratingModal?.shipmentnumber}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Rating
              value={ratingValue}
              onChange={(e, v) => setRatingValue(v)}
              size="large"
              sx={{ color: '#f59e0b' }}
            />
            <Typography variant="body2" color="text.secondary">
              {ratingValue > 0 ? `${ratingValue}/5` : 'Select rating'}
            </Typography>
          </Box>
          <TextField fullWidth multiline rows={2} label="Feedback (optional)" value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingModal(null)}>Skip</Button>
          <Button variant="contained" onClick={handleSubmitRating} disabled={!ratingValue} sx={{ bgcolor: '#f59e0b', color: '#000' }}>Submit Rating</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
