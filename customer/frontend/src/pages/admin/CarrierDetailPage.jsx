import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Chip, Rating, Button, Avatar, useTheme } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ArrowLeft, Truck, Package, MapPin, Star, Clock, TrendingUp, Phone, Mail, User } from 'lucide-react';

export default function CarrierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const c = theme.palette.custom;

  const { data: carrier, loading } = useFetch(`/carriers/${id}`);
  const p = carrier || {};

  if (loading) return <Box><PageHeader title="Carrier Profile" subtitle="Loading..." /></Box>;
  if (!carrier) return <Box><PageHeader title="Carrier Not Found" subtitle="This carrier does not exist" /></Box>;

  const statCards = [
    { label: 'Total Shipments', value: p.totalshipments || 0, icon: Package, color: '#3b82f6' },
    { label: 'On-Time Rate', value: `${p.onTimePercent || 0}%`, icon: Clock, color: '#10b981' },
    { label: 'On-Time Deliveries', value: p.ontimedeliveries || 0, icon: TrendingUp, color: isDark ? '#2dd4bf' : '#f59e0b' },
    { label: 'Rating', value: Number(p.rating || 0).toFixed(1), icon: Star, color: '#8b5cf6' },
  ];

  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate('/admin/carriers')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Carriers
      </Button>

      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: c.primaryButton, fontSize: '1.5rem', fontWeight: 700 }}>
            {(p.companyname || '?').charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>{p.companyname}</Typography>
              <StatusBadge status={p.status} />
              <Chip label={p.partnercode} size="small" variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {p.servicetype || 'Freight Carrier'} · Joined {formatDate(p.createdat)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              {p.contactperson && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <User size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary">{p.contactperson}</Typography>
                </Box>
              )}
              {p.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Phone size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary">{p.phone}</Typography>
                </Box>
              )}
              {p.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Mail size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Rating value={Number(p.rating || 0)} precision={0.5} readOnly />
            <Typography variant="caption" color="text.secondary" display="block">{p.totalshipments || 0} shipments</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} color={s.color} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Recent Shipments */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Recent Shipments</Typography>
            {(p.recentShipments || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No shipments yet</Typography>
            ) : (
              (p.recentShipments || []).slice(0, 10).map((s) => (
                <Box key={s.shipmentid} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.2, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{s.shipmentnumber}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.orders?.pickup?.city || '?'} → {s.orders?.delivery?.city || '?'} · {s.orders?.transportmode || ''}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <StatusBadge status={s.status} />
                    <Typography variant="caption" color="text.secondary" display="block">{formatDate(s.createdat)}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Routes */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Top Routes</Typography>
              {(p.routes || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No routes yet</Typography>
              ) : (
                (p.routes || []).slice(0, 5).map((r) => (
                  <Box key={r.route} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2">{r.route}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(r.modes || []).map((m) => (
                        <Chip key={m} label={m} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                      ))}
                      <Chip label={`${r.count}x`} size="small" sx={{ bgcolor: isDark ? '#1e3a5f' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: 600, height: 20 }} />
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Recent Ratings</Typography>
              {(p.recentRatings || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No ratings yet</Typography>
              ) : (
                (p.recentRatings || []).slice(0, 5).map((r, i) => (
                  <Box key={i} sx={{ py: 1.2, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Rating value={Number(r.rating)} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">{formatDate(r.createdat)}</Typography>
                    </Box>
                    {r.comment && <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{r.comment}</Typography>}
                    <Typography variant="caption" color="text.secondary">
                      — {r.users ? `${r.users.firstname} ${r.users.lastname}` : r.ratertype}
                    </Typography>
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
