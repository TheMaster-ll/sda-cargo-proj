
// dispatcher dashboard
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import { Package, Truck, AlertTriangle, Users, Weight } from 'lucide-react';
import AssignCarrierModal from '../../components/carriers/AssignCarrierModal';

export default function DispatcherDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: pendingOrders } = useFetch('/orders/pending');
  const { data: shipments } = useFetch('/shipments');
  const { data: carriers } = useFetch('/carriers');
  const [assignOrderId, setAssignOrderId] = useState(null);

  const allShipments = shipments || [];
  const activeShipments = allShipments.filter((s) => !['Delivered', 'Cancelled'].includes(s.status)).length;
  const delayed = allShipments.filter((s) => s.isdelayed).length;
  const todaysVolume = allShipments.reduce((sum, s) => sum + (s.orders?.totalweight || 0), 0);

  const pending = pendingOrders || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{t('dispatcherDash.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dispatcherDash.welcomeBack', { name: user?.name })} <Chip label="Dispatcher" size="small" sx={{ ml: 1, bgcolor: '#1a3a4a', color: '#fff', fontSize: '0.7rem' }} />
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {t('dispatcherDash.lastUpdated')}: {new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <StatCard title={t('dispatcherDash.pendingAssignment')} value={pending.length} icon={Package} color="#f59e0b" trend={pending.length > 0 ? `+${pending.length}` : null} />
        <StatCard title={t('dispatcherDash.activeShipments')} value={activeShipments} icon={Truck} color="#1a3a4a" />
        <StatCard title={t('dispatcherDash.delayedToday')} value={delayed} icon={AlertTriangle} color="#ef4444" />
        <StatCard title={t('dispatcherDash.carriersOnline')} value="—" icon={Users} color="#3b82f6" />
        <StatCard title={t('dispatcherDash.todaysVolume')} value={`${todaysVolume.toLocaleString()} kg`} icon={Weight} color="#10b981" />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>{t('dispatcherDash.pendingOrdersAssignment')}</Typography>
              <Button size="small" onClick={() => navigate('/dispatcher/orders')}>{t('common.viewAll')}</Button>
            </Box>
            {pending.slice(0, 5).map((order) => (
              <Box key={order.orderid} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: order.totalweight > 1000 ? '#ef4444' : '#f59e0b' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>{order.ordernumber}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.companies?.companyname} | {order.pickup?.city} → {order.delivery?.city} | {order.totalweight}kg
                  </Typography>
                </Box>
                <Button size="small" variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={() => setAssignOrderId(order.orderid)}>
                  {t('dispatcherDash.assignCarrier')}
                </Button>
              </Box>
            ))}
            {pending.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>{t('dispatcherDash.noPendingOrders')}</Typography>}
          </CardContent>
        </Card>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AlertTriangle size={18} /> {t('dispatcherDash.delayedShipments')}
              </Typography>
              {allShipments.filter((s) => s.isdelayed).slice(0, 3).map((s) => (
                <Box key={s.shipmentid} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #fecaca' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{s.shipmentnumber}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('dispatcherDash.delayed')}</Typography>
                  </Box>
                  <Button size="small" onClick={() => navigate(`/dispatcher/shipments/${s.shipmentid}`)}>{t('common.track')}</Button>
                </Box>
              ))}
              {delayed === 0 && <Typography variant="body2" color="text.secondary">No delays</Typography>}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Carrier Performance</Typography>
              {(carriers || []).filter(c => c.status === 'Active').slice(0, 5).map((c) => (
                <Box key={c.partnerid} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: '#1a3a4a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                      {(c.companyname || '').split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{c.companyname}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.onTimePercent}% On-time • {c.rating || 0}★</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{c.totalshipments || 0} Trips</Typography>
                </Box>
              ))}
              {(!carriers || carriers.filter(c => c.status === 'Active').length === 0) && (
                <Typography variant="body2" color="text.secondary">No active carriers</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {assignOrderId && (
        <AssignCarrierModal
          orderId={assignOrderId}
          open={!!assignOrderId}
          onClose={() => setAssignOrderId(null)}
        />
      )}
    </Box>
  );
}
