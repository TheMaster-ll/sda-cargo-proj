import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, InputAdornment,
  Stepper, Step, StepLabel, Divider, CircularProgress, ThemeProvider, createTheme
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { formatDateTime } from '../utils/helpers';
import { SHIPMENT_STATUS_ORDER } from '../utils/constants';
import { Search, Package, MapPin, Truck, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const lightTheme = createTheme({ palette: { mode: 'light' } });

function TrackingResult({ shipment }) {
  const s = shipment;
  const statusIdx = SHIPMENT_STATUS_ORDER.indexOf(
    s.status?.replace('InTransit', 'In Transit')?.replace('PickedUp', 'Picked Up')
  );
  const events = s.trackingevents || [];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header */}
      <Card sx={{ bgcolor: '#1a3a4a', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#94a3b8' }}>Tracking Code</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', fontFamily: 'monospace', letterSpacing: 2 }}>
                {s.trackingcode}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                Shipment {s.shipmentnumber}
              </Typography>
            </Box>
            <Box sx={{
              px: 2, py: 0.8, borderRadius: 2,
              bgcolor: s.status === 'Delivered' ? '#d1fae5' : s.isdelayed ? '#fef9c3' : '#dbeafe',
              color: s.status === 'Delivered' ? '#047857' : s.isdelayed ? '#a16207' : '#1d4ed8',
              fontWeight: 700, fontSize: '0.85rem'
            }}>
              {s.isdelayed && s.status !== 'Delivered' ? 'Delayed' : s.status}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={statusIdx} alternativeLabel>
            {SHIPMENT_STATUS_ORDER.map((label, i) => (
              <Step key={label} completed={i <= statusIdx}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Route & Details */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Route</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                    <MapPin size={20} color="#1d4ed8" />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{s.orders?.pickup?.locationname}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.orders?.pickup?.city}</Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ flex: 1, height: 2, bgcolor: statusIdx >= 2 ? '#10b981' : '#e2e8f0' }} />
                  <Truck size={20} color={statusIdx >= 2 ? '#10b981' : '#94a3b8'} style={{ margin: '0 8px' }} />
                  <Box sx={{ flex: 1, height: 2, bgcolor: statusIdx >= 4 ? '#10b981' : '#e2e8f0' }} />
                </Box>
                <Box sx={{ flex: 1, textAlign: 'center' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: statusIdx >= 4 ? '#d1fae5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                    <MapPin size={20} color={statusIdx >= 4 ? '#047857' : '#94a3b8'} />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{s.orders?.delivery?.locationname}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.orders?.delivery?.city}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Shipment Details</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                  <Typography variant="body2" fontWeight={500}>{s.orders?.totalweight} kg</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Pieces</Typography>
                  <Typography variant="body2" fontWeight={500}>{s.orders?.totalpieces}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Commodity</Typography>
                  <Typography variant="body2" fontWeight={500}>{s.orders?.commodity || 'General Cargo'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Carrier</Typography>
                  <Typography variant="body2" fontWeight={500}>{s.partners?.companyname || '—'}</Typography>
                </Box>
                {s.estimateddelivery && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Est. Delivery</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatDateTime(s.estimateddelivery)}</Typography>
                  </Box>
                )}
                {s.actualdelivery && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Delivered</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ color: '#047857' }}>{formatDateTime(s.actualdelivery)}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Timeline */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Tracking Timeline</Typography>
            {events.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No tracking events yet
              </Typography>
            ) : (
              events.map((ev, i) => (
                <Box key={ev.eventid} sx={{ display: 'flex', gap: 2, mb: 0, position: 'relative' }}>
                  {/* Timeline line */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                      bgcolor: i === 0 ? '#1a3a4a' : '#cbd5e1',
                      border: i === 0 ? '3px solid #bae6fd' : 'none'
                    }} />
                    {i < events.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: '#e2e8f0', my: 0.5 }} />}
                  </Box>
                  <Box sx={{ pb: 2.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {ev.eventtype === 'Checkpoint' ? ev.description : ev.eventtype}
                        </Typography>
                        {ev.eventtype !== 'Checkpoint' && (
                          <Typography variant="caption" color="text.secondary">{ev.description}</Typography>
                        )}
                        {ev.locations && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.3 }}>
                            <MapPin size={10} /> {ev.locations.locationname || ev.locations.city}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                        {formatDateTime(ev.eventtime)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default function TrackingPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [trackingCode, setTrackingCode] = useState(code || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  React.useEffect(() => {
    if (code) handleSearch(code);
  }, [code]);

  const handleSearch = async (searchCode) => {
    const c = searchCode || trackingCode;
    if (!c.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    setSearched(true);
    try {
      const { data } = await api.get(`/shipments/track/${c.trim()}`);
      if (data.success) {
        setShipment(data.data);
        if (!code) navigate(`/track/${c.trim()}`, { replace: true });
      }
    } catch {
      setError('Shipment not found. Please check your tracking code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', color: '#0f172a' }}>
      {/* Nav */}
      <Box sx={{ bgcolor: '#1a3a4a', py: 1.5, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h6" fontWeight={800} sx={{ color: '#fff', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          CargoPort
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} to="/login" variant="text" sx={{ color: '#fff' }}>Login</Button>
          <Button component={Link} to="/signup" variant="contained" sx={{ bgcolor: '#f59e0b', color: '#000' }}>Sign Up</Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: 4 }}>
        {/* Search */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Package size={40} color="#1a3a4a" style={{ marginBottom: 8 }} />
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Track Your Shipment</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your tracking code to get real-time updates on your shipment
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 500, mx: 'auto' }}>
            <TextField
              fullWidth
              placeholder="Enter tracking code (e.g., TRK-XXXXXX)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search size={20} color="#94a3b8" /></InputAdornment>,
                sx: { bgcolor: '#fff', borderRadius: 2 }
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleSearch()}
              disabled={loading}
              sx={{ bgcolor: '#1a3a4a', px: 4, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Track'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
            <CardContent sx={{ py: 4 }}>
              <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: 8 }} />
              <Typography variant="body1" fontWeight={500} color="error">{error}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Double-check the code or contact support for help.
              </Typography>
            </CardContent>
          </Card>
        )}

        {shipment && <TrackingResult shipment={shipment} />}

        {!shipment && !error && searched && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            No results found.
          </Typography>
        )}
      </Box>
    </Box>
    </ThemeProvider>
  );
}
