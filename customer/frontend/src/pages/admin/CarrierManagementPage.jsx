import React from 'react';
import { Box, Button, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

export default function CarrierManagementPage() {
  const navigate = useNavigate();
  const { data: carriers, refetch } = useFetch('/carriers');

  const columns = [
    { id: 'partnercode', label: 'Code' },
    { id: 'companyname', label: 'Company Name' },
    { id: 'contactperson', label: 'Contact' },
    { id: 'phone', label: 'Phone' },
    { id: 'servicetype', label: 'Service Type' },
    { id: 'rating', label: 'Rating', render: (r) => <Rating value={Number(r.rating)} precision={0.5} size="small" readOnly /> },
    { id: 'totalshipments', label: 'Shipments' },
    { id: 'onTimePercent', label: 'On-Time %', render: (r) => `${r.onTimePercent}%` },
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions', label: '', sortable: false,
      render: (r) => (
        <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/admin/carriers/${r.partnerid}`); }}>View</Button>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="Carrier Management" subtitle="Manage carrier partners and performance" />
      <DataTable columns={columns} rows={carriers || []} emptyMessage="No carriers found" />
    </Box>
  );
}
