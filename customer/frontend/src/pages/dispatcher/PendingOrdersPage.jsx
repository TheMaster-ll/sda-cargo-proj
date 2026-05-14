import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AssignCarrierModal from '../../components/carriers/AssignCarrierModal';
import { formatDate } from '../../utils/helpers';

export default function PendingOrdersPage() {
  const navigate = useNavigate();
  const { data: orders, refetch } = useFetch('/orders/pending');
  const [assignOrderId, setAssignOrderId] = useState(null);

  const columns = [
    { id: 'ordernumber', label: 'Order #' },
    { id: 'customer', label: 'Customer', render: (r) => r.companies?.companyname || '-' },
    { id: 'pickup', label: 'Pickup City', render: (r) => r.pickup?.city || '-' },
    { id: 'delivery', label: 'Delivery City', render: (r) => r.delivery?.city || '-' },
    { id: 'totalweight', label: 'Weight', render: (r) => `${r.totalweight || 0} kg` },
    { id: 'totalpieces', label: 'Pieces' },
    { id: 'requestedpickupdate', label: 'Requested Pickup', render: (r) => formatDate(r.requestedpickupdate) },
    { id: 'createdat', label: 'Created', render: (r) => formatDate(r.createdat) },
    {
      id: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <Button size="small" variant="contained" sx={{ bgcolor: '#1a3a4a' }} onClick={(e) => { e.stopPropagation(); setAssignOrderId(r.orderid); }}>
          Assign Carrier
        </Button>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="Pending Orders" subtitle="Orders awaiting carrier assignment" />
      <DataTable columns={columns} rows={orders || []} onRowClick={(r) => navigate(`/dispatcher/orders/${r.orderid}`)} emptyMessage="No pending orders" />
      {assignOrderId && (
        <AssignCarrierModal
          orderId={assignOrderId}
          open={!!assignOrderId}
          onClose={() => { setAssignOrderId(null); refetch(); }}
        />
      )}
    </Box>
  );
}
