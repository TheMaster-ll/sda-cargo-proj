import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, IconButton, Tooltip, Switch, FormControlLabel
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Plane, Truck, Ship } from 'lucide-react';

const MODE_ICONS = { Air: Plane, Road: Truck, Sea: Ship };
const MODE_COLORS = { Air: '#3b82f6', Road: '#f59e0b', Sea: '#06b6d4' };

export default function RatesPage() {
  const { data: rates, refetch } = useFetch('/admin/rates');
  const { data: locations } = useFetch('/orders/estimate?pickupLocationId=0&deliveryLocationId=0&weight=0');
  const [locList, setLocList] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    originLocationId: '', destinationLocationId: '', transportMode: 'Road',
    baseRate: '', ratePerKg: '', fuelSurcharge: '0', minWeight: '0', maxWeight: '',
    transitDays: '', effectiveFrom: '', effectiveTo: '', currencyId: 2
  });

  // Fetch locations separately
  useEffect(() => {
    api.get('/admin/rates').then(() => {
      // locations are embedded in rates data
    }).catch(() => {});
  }, []);

  // Extract unique locations from rates
  useEffect(() => {
    if (!rates) return;
    const locs = new Map();
    rates.forEach((r) => {
      if (r.origin) locs.set(r.origin.locationid, r.origin);
      if (r.destination) locs.set(r.destination.locationid, r.destination);
    });
    setLocList(Array.from(locs.values()));
  }, [rates]);

  const resetForm = () => setForm({
    originLocationId: '', destinationLocationId: '', transportMode: 'Road',
    baseRate: '', ratePerKg: '', fuelSurcharge: '0', minWeight: '0', maxWeight: '',
    transitDays: '', effectiveFrom: '', effectiveTo: '', currencyId: 2
  });

  const handleOpen = (rate = null) => {
    if (rate) {
      setEditing(rate.rateid);
      setForm({
        originLocationId: rate.origin?.locationid || '',
        destinationLocationId: rate.destination?.locationid || '',
        transportMode: rate.transportmode || 'Road',
        baseRate: rate.baserate || '',
        ratePerKg: rate.rateperkg || '',
        fuelSurcharge: rate.fuelsurcharge || '0',
        minWeight: rate.minweight || '0',
        maxWeight: rate.maxweight || '',
        transitDays: rate.transitdays || '',
        effectiveFrom: rate.effectivefrom || '',
        effectiveTo: rate.effectiveto || '',
        currencyId: 2
      });
    } else {
      setEditing(null);
      resetForm();
    }
    setDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/admin/rates/${editing}`, {
          baserate: Number(form.baseRate),
          rateperkg: Number(form.ratePerKg),
          fuelsurcharge: Number(form.fuelSurcharge),
          minweight: Number(form.minWeight),
          maxweight: form.maxWeight ? Number(form.maxWeight) : null,
          transitdays: form.transitDays ? Number(form.transitDays) : null,
          effectivefrom: form.effectiveFrom || null,
          effectiveto: form.effectiveTo || null,
          transportmode: form.transportMode
        });
        toast.success('Rate updated');
      } else {
        await api.post('/admin/rates', form);
        toast.success('Rate created');
      }
      setDialog(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rate?')) return;
    try {
      await api.delete(`/admin/rates/${id}`);
      toast.success('Rate deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (rate) => {
    try {
      await api.put(`/admin/rates/${rate.rateid}`, { isactive: !rate.isactive });
      toast.success(rate.isactive ? 'Rate deactivated' : 'Rate activated');
      refetch();
    } catch {
      toast.error('Failed to update');
    }
  };

  const columns = [
    {
      id: 'origin', label: 'Origin',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{r.origin?.city || '—'}</Typography>
          <Typography variant="caption" color="text.secondary">{r.origin?.locationname || ''}</Typography>
        </Box>
      )
    },
    {
      id: 'destination', label: 'Destination',
      render: (r) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>{r.destination?.city || '—'}</Typography>
          <Typography variant="caption" color="text.secondary">{r.destination?.locationname || ''}</Typography>
        </Box>
      )
    },
    {
      id: 'transportmode', label: 'Mode',
      render: (r) => {
        const Icon = MODE_ICONS[r.transportmode] || Truck;
        const color = MODE_COLORS[r.transportmode] || '#64748b';
        return (
          <Chip icon={<Icon size={14} />} label={r.transportmode} size="small"
            sx={{ bgcolor: `${color}15`, color, fontWeight: 600, fontSize: '0.75rem' }} />
        );
      }
    },
    { id: 'weight', label: 'Weight Range', render: (r) => `${r.minweight || 0} - ${r.maxweight || '∞'} kg` },
    { id: 'baserate', label: 'Base Rate', render: (r) => <Typography variant="body2" fontWeight={600}>{formatCurrency(r.baserate)}</Typography> },
    { id: 'rateperkg', label: 'Per Kg', render: (r) => formatCurrency(r.rateperkg) },
    { id: 'fuelsurcharge', label: 'Fuel', render: (r) => formatCurrency(r.fuelsurcharge) },
    { id: 'transitdays', label: 'Transit', render: (r) => r.transitdays ? `${r.transitdays} days` : '—' },
    {
      id: 'status', label: 'Active',
      render: (r) => (
        <Switch checked={r.isactive} size="small" onChange={() => handleToggleActive(r)}
          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' } }} />
      )
    },
    {
      id: 'actions', label: '', sortable: false,
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpen(r); }}><Edit2 size={14} /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(r.rateid); }} sx={{ color: '#ef4444' }}><Trash2 size={14} /></IconButton></Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="Freight Rates" subtitle="Manage pricing and rate configuration" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">{(rates || []).length} rates configured</Typography>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => handleOpen()}
          sx={{ bgcolor: '#1a3a4a', textTransform: 'none' }}>
          Add Rate
        </Button>
      </Box>

      <DataTable columns={columns} rows={rates || []} emptyMessage="No rates configured" />

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Rate' : 'Add New Rate'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            {!editing && locList.length > 0 && (
              <>
                <TextField select fullWidth label="Origin" value={form.originLocationId} onChange={(e) => setForm({ ...form, originLocationId: e.target.value })}>
                  {locList.map((l) => <MenuItem key={l.locationid} value={l.locationid}>{l.city} - {l.locationname}</MenuItem>)}
                </TextField>
                <TextField select fullWidth label="Destination" value={form.destinationLocationId} onChange={(e) => setForm({ ...form, destinationLocationId: e.target.value })}>
                  {locList.map((l) => <MenuItem key={l.locationid} value={l.locationid}>{l.city} - {l.locationname}</MenuItem>)}
                </TextField>
              </>
            )}
            <TextField select fullWidth label="Transport Mode" value={form.transportMode} onChange={(e) => setForm({ ...form, transportMode: e.target.value })}>
              <MenuItem value="Road">Road</MenuItem>
              <MenuItem value="Air">Air</MenuItem>
              <MenuItem value="Sea">Sea</MenuItem>
            </TextField>
            <TextField fullWidth label="Base Rate (PKR)" type="number" value={form.baseRate} onChange={(e) => setForm({ ...form, baseRate: e.target.value })} />
            <TextField fullWidth label="Rate Per Kg (PKR)" type="number" value={form.ratePerKg} onChange={(e) => setForm({ ...form, ratePerKg: e.target.value })} />
            <TextField fullWidth label="Fuel Surcharge (PKR)" type="number" value={form.fuelSurcharge} onChange={(e) => setForm({ ...form, fuelSurcharge: e.target.value })} />
            <TextField fullWidth label="Min Weight (kg)" type="number" value={form.minWeight} onChange={(e) => setForm({ ...form, minWeight: e.target.value })} />
            <TextField fullWidth label="Max Weight (kg)" type="number" value={form.maxWeight} onChange={(e) => setForm({ ...form, maxWeight: e.target.value })} placeholder="Leave empty for unlimited" />
            <TextField fullWidth label="Transit Days" type="number" value={form.transitDays} onChange={(e) => setForm({ ...form, transitDays: e.target.value })} />
            <TextField fullWidth label="Effective From" type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Effective To" type="date" value={form.effectiveTo} onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#1a3a4a' }}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
