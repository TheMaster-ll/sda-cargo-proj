import React, { useState } from 'react';
import {
  Box, Button, Rating, Dialog, DialogTitle, DialogContent, IconButton,
  Typography, Card, CardContent, Chip, Divider, CircularProgress, LinearProgress
} from '@mui/material';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import {
  X, Truck, MapPin, Phone, Mail, Star, Package, Clock, TrendingUp,
  AlertTriangle, CheckCircle, Plane, Ship, User
} from 'lucide-react';

const modeIcons = { Air: Plane, Road: Truck, Sea: Ship };

export default function CarrierNetworkPage() {
  const { data: carriers } = useFetch('/carriers');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const openProfile = async (partnerId) => {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileData(null);
    try {
      const { data } = await api.get(`/carriers/${partnerId}`);
      if (data.success) setProfileData(data.data);
    } catch {
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const columns = [
    { id: 'companyname', label: 'Company Name' },
    { id: 'servicetype', label: 'Service Type' },
    { id: 'totalshipments', label: 'Total Shipments' },
    { id: 'onTimePercent', label: 'On-Time %', render: (r) => `${r.onTimePercent}%` },
    { id: 'rating', label: 'Rating', render: (r) => <Rating value={Number(r.rating)} precision={0.5} size="small" readOnly sx={{ color: '#f59e0b' }} /> },
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions', label: '', sortable: false,
      render: (r) => (
        <Button
          size="small" variant="outlined"
          onClick={(e) => { e.stopPropagation(); openProfile(r.partnerid); }}
          sx={{ borderColor: '#1a3a4a', color: '#1a3a4a' }}
        >
          View Profile
        </Button>
      )
    }
  ];

  const p = profileData;

  return (
    <Box>
      <PageHeader title="Carrier Network" subtitle="Browse and manage carrier partners" />
      <DataTable columns={columns} rows={carriers || []} emptyMessage="No carriers found" />

      {/* Carrier Profile Dialog */}
      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#1a3a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="#fff" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>{p?.companyname || 'Loading...'}</Typography>
              {p?.partnercode && <Typography variant="caption" color="text.secondary">{p.partnercode}</Typography>}
            </Box>
          </Box>
          <IconButton onClick={() => setProfileOpen(false)}><X size={20} /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {profileLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : p ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Top Stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                <Card variant="outlined" sx={{ textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Package size={20} color="#1a3a4a" />
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{p.totalshipments || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Shipments</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <CheckCircle size={20} color="#10b981" />
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{p.onTimePercent || 0}%</Typography>
                    <Typography variant="caption" color="text.secondary">On-Time Rate</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Star size={20} color="#f59e0b" />
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{p.rating || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">Avg Rating</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ textAlign: 'center' }}>
                  <CardContent sx={{ py: 2 }}>
                    <StatusBadge status={p.status} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Status</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Contact & Service Info */}
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Contact Information</Typography>
                    {p.contactperson && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <User size={16} color="#64748b" />
                        <Typography variant="body2">{p.contactperson}</Typography>
                      </Box>
                    )}
                    {p.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone size={16} color="#64748b" />
                        <Typography variant="body2">{p.phone}</Typography>
                      </Box>
                    )}
                    {p.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Mail size={16} color="#64748b" />
                        <Typography variant="body2">{p.email}</Typography>
                      </Box>
                    )}
                    {p.partnercontacts?.length > 0 && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Additional Contacts</Typography>
                        {p.partnercontacts.map((c, i) => (
                          <Box key={i} sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight={500}>{c.contactname} {c.designation ? `(${c.designation})` : ''}</Typography>
                            {c.phone && <Typography variant="caption" color="text.secondary">{c.phone}</Typography>}
                          </Box>
                        ))}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Service Details</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Service Type</Typography>
                        <Typography variant="body2" fontWeight={500}>{p.servicetype || '—'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">On-Time Deliveries</Typography>
                        <Typography variant="body2" fontWeight={500}>{p.ontimedeliveries || 0}</Typography>
                      </Box>
                    </Box>
                    {p.equipment?.length > 0 && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">Equipment</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          {p.equipment.map((eq, i) => (
                            <Chip key={i} label={`${eq.equipmenttype} — ${eq.registrationnumber || eq.capacity || ''}`} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Routes */}
              {p.routes?.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                      <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Active Routes
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {p.routes.map((r, i) => {
                        const MIcon = r.modes?.[0] ? (modeIcons[r.modes[0]] || Truck) : Truck;
                        return (
                          <Chip
                            key={i}
                            icon={<MIcon size={14} />}
                            label={`${r.route} (${r.count})`}
                            size="small"
                            sx={{ bgcolor: '#f0f9ff', color: '#1a3a4a', fontWeight: 500 }}
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Configured Routes & Rates */}
              {p.configuredRates?.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                      <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Configured Routes & Rates
                    </Typography>
                    <Box sx={{ overflowX: 'auto', maxHeight: 250, overflowY: 'auto' }}>
                      <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <Box component="thead">
                          <Box component="tr" sx={{ borderBottom: '2px solid #e2e8f0' }}>
                            {['Route', 'Mode', 'Base Rate', 'Per Kg', 'Fuel', 'Weight Range', 'Transit'].map(h => (
                              <Box component="th" key={h} sx={{ py: 1, px: 1.5, textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</Box>
                            ))}
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {p.configuredRates.map((r, i) => {
                            const MIcon = modeIcons[r.transportmode] || Truck;
                            return (
                              <Box component="tr" key={r.rateid} sx={{ borderBottom: '1px solid #f1f5f9', '&:hover': { bgcolor: '#f8fafc' } }}>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                  <Typography variant="body2" fontWeight={500}>{r.routeLabel}</Typography>
                                  <Typography variant="caption" color="text.secondary">{r.originName} → {r.destinationName}</Typography>
                                </Box>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                  <Chip icon={<MIcon size={12} />} label={r.transportmode} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                                </Box>
                                <Box component="td" sx={{ py: 1, px: 1.5, fontWeight: 600 }}>Rs {Number(r.baserate).toLocaleString()}</Box>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>Rs {Number(r.rateperkg).toLocaleString()}</Box>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>Rs {Number(r.fuelsurcharge).toLocaleString()}</Box>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                  {r.minweight}kg {r.maxweight ? `– ${r.maxweight}kg` : '+'}
                                </Box>
                                <Box component="td" sx={{ py: 1, px: 1.5 }}>
                                  {r.transitdays ? `${r.transitdays} days` : '—'}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Recent Shipments */}
              {p.recentShipments?.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Recent Shipments</Typography>
                    <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                      {p.recentShipments.slice(0, 10).map((s) => (
                        <Box key={s.shipmentid} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{s.shipmentnumber}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {s.orders?.pickup?.city} → {s.orders?.delivery?.city} • {s.orders?.totalweight}kg
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {s.isdelayed && <AlertTriangle size={14} color="#f59e0b" />}
                            <StatusBadge status={s.status} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Recent Ratings */}
              {p.recentRatings?.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Recent Reviews</Typography>
                    {p.recentRatings.map((r, i) => (
                      <Box key={i} sx={{ py: 1, borderBottom: i < p.recentRatings.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={r.rating} size="small" readOnly sx={{ color: '#f59e0b' }} />
                            <Chip label={r.ratertype} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: r.ratertype === 'Customer' ? '#dbeafe' : '#f0fdf4', color: r.ratertype === 'Customer' ? '#1d4ed8' : '#047857' }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {r.users?.firstname} {r.users?.lastname}
                          </Typography>
                        </Box>
                        {r.comment && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>"{r.comment}"</Typography>}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}

            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Failed to load carrier profile.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
