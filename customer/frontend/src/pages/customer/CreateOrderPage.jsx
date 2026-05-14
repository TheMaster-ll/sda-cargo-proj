import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Stepper, Step, StepLabel,
  MenuItem, CircularProgress, Divider, Alert, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import { formatCurrency } from '../../utils/helpers';
import { PACKAGING_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { MapPin, Package, CheckCircle, Plane, Truck, Ship, AlertTriangle, User } from 'lucide-react';

const steps = ['Locations', 'Package Details', 'Review'];
const modeIcons = { Air: Plane, Road: Truck, Sea: Ship };

// Infer location type from name for route validation
const getLocationType = (name) => {
  if (!name) return 'unknown';
  const n = name.toLowerCase();
  if (n.includes('port') || n.includes('seaport')) return 'port';
  if (n.includes('airport') || n.includes('air hub')) return 'airport';
  if (n.includes('distribution') || n.includes('dist')) return 'distribution';
  if (n.includes('warehouse') || n.includes('wh')) return 'warehouse';
  if (n.includes('hub') || n.includes('terminal')) return 'hub';
  if (n.includes('depot')) return 'depot';
  return 'general';
};

// Validate route combination
const validateRoute = (pickup, delivery) => {
  if (!pickup || !delivery) return null;

  // Same location
  if (pickup.locationid === delivery.locationid) {
    return { severity: 'error', message: 'Pickup and delivery locations cannot be the same.' };
  }

  const pickupType = getLocationType(pickup.locationname);
  const deliveryType = getLocationType(delivery.locationname);
  const sameCity = pickup.city?.toLowerCase() === delivery.city?.toLowerCase();

  // Same city, same type
  if (sameCity && pickupType === deliveryType && pickupType !== 'general') {
    return { severity: 'warning', message: `Both locations are ${pickupType}s in ${pickup.city}. This route may not be efficient.` };
  }

  // Distribution centre to port/airport in different city — doesn't make logistic sense
  if (pickupType === 'distribution' && (deliveryType === 'port' || deliveryType === 'airport') && !sameCity) {
    return { severity: 'warning', message: `Shipping from a distribution centre in ${pickup.city} to a ${deliveryType} in ${delivery.city} is unusual. Consider shipping to a local ${deliveryType} first.` };
  }

  // Port/airport to port/airport in different cities
  if ((pickupType === 'port' || pickupType === 'airport') && (deliveryType === 'port' || deliveryType === 'airport') && !sameCity) {
    return { severity: 'warning', message: `Routing between two ${pickupType === deliveryType ? pickupType + 's' : 'transport hubs'} in different cities. Verify this is the intended route.` };
  }

  // Warehouse to warehouse same city
  if (sameCity && pickupType === 'warehouse' && deliveryType === 'warehouse') {
    return { severity: 'warning', message: `Both are warehouses in ${pickup.city}. Consider using internal transfer instead.` };
  }

  return null;
};

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [form, setForm] = useState({
    pickupLocationId: '', deliveryLocationId: '',
    pickupContactName: '', pickupContactPhone: '', pickupAddress: '',
    deliveryContactName: '', deliveryContactPhone: '', deliveryAddress: '',
    requestedPickupDate: '',
    specialInstructions: '',
    commodity: '', totalPieces: 1, totalWeight: '',
    length: '', width: '', height: '', packagingType: 'Box',
    itemName: 'General Cargo'
  });

  useEffect(() => {
    api.get('/orders/estimate', { params: { pickupLocationId: 1, deliveryLocationId: 1, weight: 1 } }).catch(() => {});
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const { data } = await api.get('/orders/my');
      const locRes = await api.get('/orders/estimate', { params: { pickupLocationId: 1, deliveryLocationId: 2, weight: 100 } });
    } catch {}
    try {
      const res = await fetch('https://xdnplapoknzafuleuzdj.supabase.co/rest/v1/locations?select=*&isactive=eq.true', {
        headers: {
          apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbnBsYXBva256YWZ1bGV1emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDgwMDgsImV4cCI6MjA5MzIyNDAwOH0.K85E_gSg5SbTZ0kEXfQOxwV8Sa6jmvcrxA0lZEFOdDk',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbnBsYXBva256YWZ1bGV1emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDgwMDgsImV4cCI6MjA5MzIyNDAwOH0.K85E_gSg5SbTZ0kEXfQOxwV8Sa6jmvcrxA0lZEFOdDk`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setLocations(data);
    } catch (err) {
      console.error('Failed to load locations');
    }
  };

  const fetchEstimate = async () => {
    if (!form.pickupLocationId || !form.deliveryLocationId || !form.totalWeight) return;
    try {
      const { data } = await api.get('/orders/estimate', {
        params: { pickupLocationId: form.pickupLocationId, deliveryLocationId: form.deliveryLocationId, weight: form.totalWeight }
      });
      if (data.success) setEstimate(data.data);
    } catch {
      setEstimate(null);
    }
  };

  useEffect(() => {
    if (activeStep === 1 && form.totalWeight) fetchEstimate();
  }, [form.totalWeight, form.pickupLocationId, form.deliveryLocationId, activeStep]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        pickupLocationId: parseInt(form.pickupLocationId),
        deliveryLocationId: parseInt(form.deliveryLocationId),
        requestedPickupDate: form.requestedPickupDate || null,
        requestedDeliveryDate: null,
        totalWeight: parseFloat(form.totalWeight),
        totalPieces: parseInt(form.totalPieces) || 1,
        commodity: form.commodity,
        specialInstructions: form.specialInstructions,
        pickupContactName: form.pickupContactName,
        pickupContactPhone: form.pickupContactPhone,
        pickupAddress: form.pickupAddress,
        deliveryContactName: form.deliveryContactName,
        deliveryContactPhone: form.deliveryContactPhone,
        deliveryAddress: form.deliveryAddress,
        items: [{
          itemName: form.itemName || 'General Cargo',
          quantity: parseInt(form.totalPieces) || 1,
          weight: parseFloat(form.totalWeight),
          length: parseFloat(form.length) || null,
          width: parseFloat(form.width) || null,
          height: parseFloat(form.height) || null,
          packagingType: form.packagingType
        }]
      };
      const { data } = await api.post('/orders', payload);
      if (data.success) {
        toast.success(`Order ${data.data.ordernumber} created!`);
        navigate(`/customer/orders/${data.data.orderid}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const getPickupLoc = () => locations.find((l) => l.locationid === parseInt(form.pickupLocationId));
  const getDeliveryLoc = () => locations.find((l) => l.locationid === parseInt(form.deliveryLocationId));
  const ModeIcon = estimate ? (modeIcons[estimate.transportMode] || Truck) : Truck;

  // Route validation
  const routeWarning = useMemo(() => {
    const pickup = getPickupLoc();
    const delivery = getDeliveryLoc();
    return validateRoute(pickup, delivery);
  }, [form.pickupLocationId, form.deliveryLocationId, locations]);

  // Fill contact fields with logged-in user's info
  const fillSelf = (type) => {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || '';
    const phone = user?.phone || '';
    if (type === 'pickup') {
      setForm((prev) => ({ ...prev, pickupContactName: name, pickupContactPhone: phone }));
    } else {
      setForm((prev) => ({ ...prev, deliveryContactName: name, deliveryContactPhone: phone }));
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create New Shipment"
        breadcrumbs={[{ label: 'Dashboard', path: '/customer/dashboard' }, { label: 'Create Order' }]}
      />

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
      </Stepper>

      {activeStep === 0 && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MapPin size={20} color="#1a3a4a" />
                <Typography variant="subtitle1" fontWeight={600}>Pickup Address</Typography>
              </Box>
              <TextField select fullWidth label="Pickup Location" value={form.pickupLocationId} onChange={handleChange('pickupLocationId')} sx={{ mb: 2 }}>
                {locations.map((l) => <MenuItem key={l.locationid} value={l.locationid}>{l.locationcode} - {l.locationname}, {l.city}</MenuItem>)}
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>Contact Details</Typography>
                <Chip
                  icon={<User size={14} />}
                  label="Self"
                  size="small"
                  onClick={() => fillSelf('pickup')}
                  sx={{ cursor: 'pointer', bgcolor: '#f0f9ff', color: '#1a3a4a', fontWeight: 600, '&:hover': { bgcolor: '#dbeafe' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth label="Contact Person" value={form.pickupContactName} onChange={handleChange('pickupContactName')} />
                <TextField fullWidth label="Phone" value={form.pickupContactPhone} onChange={handleChange('pickupContactPhone')} />
              </Box>
              <TextField fullWidth label="Address" value={form.pickupAddress} onChange={handleChange('pickupAddress')} sx={{ mb: 2 }} />
              <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>Preferred Pickup Date</Typography>
              <TextField fullWidth type="date" value={form.requestedPickupDate} onChange={handleChange('requestedPickupDate')} sx={{ mb: 2 }} />
              <TextField fullWidth multiline rows={2} label="Special Instructions" value={form.specialInstructions} onChange={handleChange('specialInstructions')} />
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MapPin size={20} color="#f59e0b" />
                <Typography variant="subtitle1" fontWeight={600}>Delivery Address</Typography>
              </Box>
              <TextField select fullWidth label="Delivery Location" value={form.deliveryLocationId} onChange={handleChange('deliveryLocationId')} sx={{ mb: 2 }}>
                {locations.map((l) => <MenuItem key={l.locationid} value={l.locationid}>{l.locationcode} - {l.locationname}, {l.city}</MenuItem>)}
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={500}>Contact Details</Typography>
                <Chip
                  icon={<User size={14} />}
                  label="Self"
                  size="small"
                  onClick={() => fillSelf('delivery')}
                  sx={{ cursor: 'pointer', bgcolor: '#fff7ed', color: '#92400e', fontWeight: 600, '&:hover': { bgcolor: '#fed7aa' } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth label="Contact Person" value={form.deliveryContactName} onChange={handleChange('deliveryContactName')} />
                <TextField fullWidth label="Phone" value={form.deliveryContactPhone} onChange={handleChange('deliveryContactPhone')} />
              </Box>
              <TextField fullWidth label="Address" value={form.deliveryAddress} onChange={handleChange('deliveryAddress')} sx={{ mb: 2 }} />
              <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                Delivery dates are automatically estimated based on route and transport mode.
              </Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Route validation alert */}
      {activeStep === 0 && routeWarning && (
        <Alert
          severity={routeWarning.severity}
          icon={<AlertTriangle size={20} />}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          {routeWarning.message}
        </Alert>
      )}

      {activeStep === 1 && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Card sx={{ flex: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Package Details</Typography>
              <TextField fullWidth label="Commodity" value={form.commodity} onChange={handleChange('commodity')} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth label="Total Pieces" type="number" value={form.totalPieces} onChange={handleChange('totalPieces')} />
                <TextField fullWidth label="Total Weight (kg)" type="number" required value={form.totalWeight} onChange={handleChange('totalWeight')} />
              </Box>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Dimensions (cm)</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField fullWidth label="Length" type="number" value={form.length} onChange={handleChange('length')} />
                <TextField fullWidth label="Width" type="number" value={form.width} onChange={handleChange('width')} />
                <TextField fullWidth label="Height" type="number" value={form.height} onChange={handleChange('height')} />
              </Box>
              <TextField select fullWidth label="Packaging Type" value={form.packagingType} onChange={handleChange('packagingType')}>
                {PACKAGING_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </CardContent>
          </Card>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {estimate && (
              <>
                <Card sx={{ bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ModeIcon size={20} />
                      <Typography variant="subtitle2" fontWeight={600}>Recommended: {estimate.transportMode}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Based on weight of {form.totalWeight} kg
                    </Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Estimated Cost</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Base Rate</Typography>
                      <Typography variant="body2">{formatCurrency(estimate.baseRate)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">Weight Charge</Typography>
                      <Typography variant="body2">{formatCurrency(estimate.weightCharge)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Fuel Surcharge</Typography>
                      <Typography variant="body2">{formatCurrency(estimate.fuelSurcharge)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                      <Typography variant="subtitle2" fontWeight={700} color="primary">{formatCurrency(estimate.total)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
            {!estimate && form.totalWeight && (
              <Alert severity="warning">No rate found for this route/weight combination.</Alert>
            )}
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Review & Confirm</Typography>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Pickup</Typography>
                <Typography variant="body2">{getPickupLoc()?.locationname}, {getPickupLoc()?.city}</Typography>
                {form.pickupContactName && <Typography variant="body2">Contact: {form.pickupContactName}</Typography>}
                {form.pickupContactPhone && <Typography variant="body2">Phone: {form.pickupContactPhone}</Typography>}
                {form.requestedPickupDate && <Typography variant="body2">Date: {form.requestedPickupDate}</Typography>}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Delivery</Typography>
                <Typography variant="body2">{getDeliveryLoc()?.locationname}, {getDeliveryLoc()?.city}</Typography>
                {form.deliveryContactName && <Typography variant="body2">Contact: {form.deliveryContactName}</Typography>}
                {form.deliveryContactPhone && <Typography variant="body2">Phone: {form.deliveryContactPhone}</Typography>}
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Package</Typography>
            <Typography variant="body2">Weight: {form.totalWeight} kg | Pieces: {form.totalPieces} | Packaging: {form.packagingType}</Typography>
            {form.commodity && <Typography variant="body2">Commodity: {form.commodity}</Typography>}
            {estimate && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>Cost Estimate</Typography>
                <Typography variant="body2">Mode: {estimate.transportMode} | Total: {formatCurrency(estimate.total)}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={() => activeStep === 0 ? navigate(-1) : setActiveStep(activeStep - 1)}>
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        {activeStep < 2 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep(activeStep + 1)}
            disabled={activeStep === 0 && (!form.pickupLocationId || !form.deliveryLocationId || routeWarning?.severity === 'error')}
            sx={{ bgcolor: '#1a3a4a' }}
          >
            Continue to {steps[activeStep + 1]} →
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ bgcolor: '#f59e0b', color: '#000' }}>
            {loading ? <CircularProgress size={22} /> : 'Confirm Order'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
