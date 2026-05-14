import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, Stepper, Step, StepLabel, CircularProgress, TextField, Rating, IconButton, useTheme } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { SHIPMENT_STATUS_ORDER } from '../../utils/constants';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Star, Truck as TruckIcon, Copy } from 'lucide-react';

export default function OrderDetailPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, loading, refetch } = useFetch(`/orders/${id}`);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [existingRatings, setExistingRatings] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const shipment = order?.shipments?.[0];

  useEffect(() => {
    if (shipment?.shipmentid) {
      api.get(`/ratings/${shipment.shipmentid}`).then(({ data }) => {
        if (data.success) {
          setExistingRatings(data.data);
          const myRating = data.data.find(r => r.ratertype === 'Customer');
          if (myRating) {
            setHasRated(true);
            setRatingValue(myRating.rating);
            setRatingComment(myRating.comment || '');
          }
        }
      }).catch(() => {});
    }
  }, [shipment?.shipmentid]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!order) return <Typography>Order not found</Typography>;

  const events = shipment?.trackingevents?.sort((a, b) => new Date(a.eventtime) - new Date(b.eventtime)) || [];
  const currentStatusIdx = SHIPMENT_STATUS_ORDER.indexOf(shipment?.status?.replace('InTransit', 'In Transit')?.replace('PickedUp', 'Picked Up'));

  const handleSubmitRating = async () => {
    if (!ratingValue) return toast.error('Please select a rating');
    setSubmittingRating(true);
    try {
      await api.post(`/ratings/${shipment.shipmentid}`, { rating: ratingValue, comment: ratingComment });
      toast.success('Rating submitted!');
      setHasRated(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success('Order cancelled');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <Box>
      <PageHeader
        title={`Order ${order.ordernumber}`}
        breadcrumbs={[
          { label: 'Dashboard', path: '/customer/dashboard' },
          { label: 'Orders', path: '/customer/orders' },
          { label: order.ordernumber }
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <StatusBadge status={order.status} size="medium" />
        {order.status === 'Pending' && (
          <Button variant="outlined" color="error" onClick={handleCancel}>Cancel Order</Button>
        )}
      </Box>

      {shipment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Shipment Progress</Typography>
            <Stepper activeStep={currentStatusIdx} alternativeLabel>
              {SHIPMENT_STATUS_ORDER.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
            {shipment.trackingcode && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: isDark ? '#1e293b' : '#f0f9ff', border: `1px solid ${isDark ? '#334155' : '#bae6fd'}`, borderRadius: 2, px: 2, py: 0.8 }}>
                  <Typography variant="body2" color="text.secondary">Tracking Code:</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace', letterSpacing: 1.5, color: isDark ? '#e2e8f0' : '#1a3a4a' }}>
                    {shipment.trackingcode}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(shipment.trackingcode);
                      toast.success('Tracking code copied!');
                    }}
                    sx={{ color: '#64748b', ml: -0.5 }}
                  >
                    <Copy size={16} />
                  </IconButton>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Cargo Details</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box><Typography variant="caption" color="text.secondary">Commodity</Typography><Typography variant="body2">{order.commodity || '-'}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Weight</Typography><Typography variant="body2">{order.totalweight} kg</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Pieces</Typography><Typography variant="body2">{order.totalpieces}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Transport Mode</Typography><Typography variant="body2">{order.transportmode || '-'}</Typography></Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Route</Typography>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Pickup</Typography>
                  <Typography variant="body2" fontWeight={500}>{order.pickup?.locationname}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.pickup?.city}, {order.pickup?.country}</Typography>
                  {order.requestedpickupdate && <Typography variant="caption">{formatDateTime(order.requestedpickupdate)}</Typography>}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Delivery</Typography>
                  <Typography variant="body2" fontWeight={500}>{order.delivery?.locationname}</Typography>
                  <Typography variant="body2" color="text.secondary">{order.delivery?.city}, {order.delivery?.country}</Typography>
                  {order.requesteddeliverydate && <Typography variant="caption">{formatDateTime(order.requesteddeliverydate)}</Typography>}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Cost Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Estimated Cost</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(order.estimatedcost)}</Typography>
              </Box>
              {shipment?.totalcost && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipment Cost</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(shipment.totalcost)}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Carrier Info & Rating */}
          {shipment?.partners && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <TruckIcon size={18} color="#1a3a4a" />
                  <Typography variant="subtitle2" fontWeight={600}>Carrier</Typography>
                </Box>
                <Typography variant="body2" fontWeight={500}>{shipment.partners.companyname}</Typography>
                {shipment.partners.partnercode && (
                  <Typography variant="caption" color="text.secondary">Code: {shipment.partners.partnercode}</Typography>
                )}

                {/* Rating section - only for delivered shipments */}
                {shipment.status === 'Delivered' && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      {hasRated ? 'Your Rating' : 'Rate This Carrier'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating
                        value={ratingValue}
                        onChange={(e, v) => { if (!hasRated) setRatingValue(v); }}
                        readOnly={hasRated}
                        sx={{ color: '#f59e0b' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {ratingValue > 0 ? `${ratingValue}/5` : ''}
                      </Typography>
                    </Box>
                    {!hasRated ? (
                      <>
                        <TextField
                          fullWidth size="small" multiline rows={2}
                          placeholder="Optional feedback..."
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Button
                          variant="contained" size="small" fullWidth
                          onClick={handleSubmitRating}
                          disabled={submittingRating || !ratingValue}
                          sx={{ bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}
                        >
                          {submittingRating ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                      </>
                    ) : (
                      ratingComment && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          "{ratingComment}"
                        </Typography>
                      )
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Tracking Events</Typography>
              {events.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tracking events yet</Typography>
              ) : (
                events.map((ev, i) => (
                  <Box key={ev.eventid} sx={{ display: 'flex', gap: 2, mb: 2, position: 'relative' }}>
                    <Box sx={{
                      width: 12, height: 12, borderRadius: '50%',
                      bgcolor: i === events.length - 1 ? '#1a3a4a' : '#cbd5e1',
                      mt: 0.5, flexShrink: 0
                    }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{ev.eventtype}</Typography>
                      <Typography variant="caption" color="text.secondary">{ev.description}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {formatDateTime(ev.eventtime)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
