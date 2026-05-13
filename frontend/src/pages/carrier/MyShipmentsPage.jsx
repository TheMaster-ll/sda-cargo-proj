import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MapPin } from 'lucide-react';

const VALID_NEXT = {
  Assigned: ['Picked Up'],
  'Picked Up': ['In Transit'],
  PickedUp: ['In Transit'],
  'In Transit': ['Delivered'],
  InTransit: ['Delivered']
};

export default function MyShipmentsPage() {
  const navigate = useNavigate();
  const { data: shipments, refetch } = useFetch('/shipments/my');
  const [statusFilter, setStatusFilter] = useState('');
  const [updateModal, setUpdateModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [checkpointModal, setCheckpointModal] = useState(null);
  const [checkpointDesc, setCheckpointDesc] = useState('');
  const [submittingCheckpoint, setSubmittingCheckpoint] = useState(false);

  const CHECKPOINT_PRESETS = [
    'Arrived at checkpoint',
    'Cleared weighbridge',
    'Departed hub',
    'Arrived at destination hub',
    'Out for delivery',
    'Waiting for clearance',
    'Package inspected',
    'Weather delay — holding at station'
  ];

  const handleAddCheckpoint = async () => {
    if (!checkpointDesc.trim()) return toast.error('Please enter a description');
    setSubmittingCheckpoint(true);
    try {
      await api.post(`/shipments/${checkpointModal.shipmentid}/checkpoint`, { description: checkpointDesc });
      toast.success('Update added! Customer and dispatcher notified.');
      setCheckpointModal(null);
      setCheckpointDesc('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add update');
    } finally {
      setSubmittingCheckpoint(false);
    }
  };

  const filtered = statusFilter ? (shipments || []).filter((s) => s.status === statusFilter) : (shipments || []);

  const handleUpdate = async () => {
    try {
      await api.put(`/shipments/${updateModal.shipmentid}/status`, { status: newStatus, note });
      toast.success(`Status updated to ${newStatus}`);
      setUpdateModal(null);
      setNote('');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const columns = [
    { id: 'shipmentnumber', label: 'Shipment #' },
    { id: 'route', label: 'Route', render: (r) => `${r.orders?.pickup?.city || '?'} → ${r.orders?.delivery?.city || '?'}` },
    { id: 'customer', label: 'Customer', render: (r) => r.orders?.companies?.companyname || '-' },
    { id: 'weight', label: 'Weight', render: (r) => `${r.orders?.totalweight || 0} kg` },
    { id: 'scheduledpickup', label: 'Pickup Date', render: (r) => formatDate(r.scheduledpickup) },
    { id: 'estimateddelivery', label: 'Delivery Date', render: (r) => formatDate(r.estimateddelivery) },
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {VALID_NEXT[r.status] && (
            <Button size="small" variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={(e) => { e.stopPropagation(); setUpdateModal(r); setNewStatus(VALID_NEXT[r.status][0]); }}>
              Update Status
            </Button>
          )}
          {!['Delivered', 'Cancelled'].includes(r.status) && (
            <Button size="small" variant="outlined" startIcon={<MapPin size={14} />} onClick={(e) => { e.stopPropagation(); setCheckpointModal(r); setCheckpointDesc(''); }} sx={{ borderColor: '#f59e0b', color: '#92400e' }}>
              Add Update
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="My Shipments" subtitle="Manage your assigned shipments" />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Assigned">Assigned</MenuItem>
          <MenuItem value="Picked Up">Picked Up</MenuItem>
          <MenuItem value="In Transit">In Transit</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </TextField>
      </Box>
      <DataTable columns={columns} rows={filtered} emptyMessage="No shipments assigned" />

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
          <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: '#1a3a4a' }}>Confirm Update</Button>
        </DialogActions>
      </Dialog>

      {/* Checkpoint Dialog */}
      <Dialog open={!!checkpointModal} onClose={() => setCheckpointModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Shipment Update</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a checkpoint update for <strong>{checkpointModal?.shipmentnumber}</strong>. This will be visible to the customer and dispatcher.
          </Typography>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>Quick Select</Typography>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
            {CHECKPOINT_PRESETS.map((preset) => (
              <Chip
                key={preset}
                label={preset}
                size="small"
                onClick={() => setCheckpointDesc(preset)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: checkpointDesc === preset ? '#1a3a4a' : '#f1f5f9',
                  color: checkpointDesc === preset ? '#fff' : '#475569',
                  '&:hover': { bgcolor: checkpointDesc === preset ? '#1a3a4a' : '#e2e8f0' }
                }}
              />
            ))}
          </Box>
          <TextField
            fullWidth multiline rows={2}
            label="Update Description"
            value={checkpointDesc}
            onChange={(e) => setCheckpointDesc(e.target.value)}
            placeholder="e.g., Arrived at Hyderabad checkpoint, cargo inspected"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckpointModal(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddCheckpoint}
            disabled={submittingCheckpoint || !checkpointDesc.trim()}
            sx={{ bgcolor: '#f59e0b', color: '#000' }}
          >
            {submittingCheckpoint ? 'Sending...' : 'Send Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
