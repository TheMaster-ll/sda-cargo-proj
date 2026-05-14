import React, { useState } from 'react';
import { Box, Typography, Chip, TextField, InputAdornment, Button, useTheme } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DollarSign, CheckCircle, AlertTriangle, Clock, Search, CreditCard, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function InvoicesPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textAccent = isDark ? '#e2e8f0' : '#1a3a4a';
  const { t } = useTranslation();
  const { user } = useAuth();
  const isDispatcher = user?.role === 'Dispatcher' || user?.role === 'Admin';
  const { data: invoices, refetch } = useFetch(isDispatcher ? '/invoices' : '/invoices/my');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [payingId, setPayingId] = useState(null);

  const handlePay = async (invoiceId) => {
    setPayingId(invoiceId);
    try {
      await api.put(`/invoices/${invoiceId}/pay`);
      toast.success('Payment successful!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const all = invoices || [];
  const totalDue = all.filter((i) => i.status === 'Pending').reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = all.filter((i) => i.status === 'Paid').reduce((s, i) => s + Number(i.total), 0);
  const overdue = all.filter((i) => i.status === 'Pending' && i.duedate && i.duedate < new Date().toISOString().slice(0, 10)).length;
  const pendingCount = all.filter((i) => i.status === 'Pending').length;

  const filtered = all.filter((inv) => {
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesSearch = !searchQuery ||
      inv.invoicenumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.shipments?.orders?.ordernumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns = [
    {
      id: 'invoicenumber', label: t('invoices.invoiceNumber'),
      render: (r) => <Typography variant="body2" fontWeight={600} sx={{ color: textAccent }}>{r.invoicenumber}</Typography>
    },
    {
      id: 'order', label: t('myOrders.orderNumber'),
      render: (r) => r.shipments?.orders?.ordernumber || '-'
    },
    { id: 'invoicedate', label: 'Issue Date', render: (r) => formatDate(r.invoicedate) },
    { id: 'duedate', label: 'Due Date', render: (r) => {
      const isOverdue = r.status === 'Pending' && r.duedate && r.duedate < new Date().toISOString().slice(0, 10);
      return (
        <Typography variant="body2" sx={{ color: isOverdue ? '#ef4444' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
          {formatDate(r.duedate)}
        </Typography>
      );
    }},
    {
      id: 'total', label: 'Amount',
      render: (r) => <Typography variant="body2" fontWeight={600}>{formatCurrency(r.total)}</Typography>
    },
    { id: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      id: 'actions', label: '', sortable: false,
      render: (r) => {
        const isOverdue = r.status === 'Pending' && r.duedate && r.duedate < new Date().toISOString().slice(0, 10);
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isDispatcher && r.status === 'Pending' && (
              <Button
                size="small"
                variant="contained"
                startIcon={<CreditCard size={14} />}
                disabled={payingId === r.invoiceid}
                onClick={(e) => { e.stopPropagation(); handlePay(r.invoiceid); }}
                sx={{ bgcolor: '#10b981', fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
              >
                {payingId === r.invoiceid ? 'Processing...' : 'Pay Now'}
              </Button>
            )}
            {isDispatcher && isOverdue && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Bell size={14} />}
                onClick={(e) => { e.stopPropagation(); toast.success('Email sent!'); }}
                sx={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.75rem', textTransform: 'none', '&:hover': { bgcolor: '#fef2f2' } }}
              >
                Send Reminder
              </Button>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <PageHeader title="Invoices" subtitle="View your billing and payment history" />

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard title="Total Due" value={formatCurrency(totalDue)} icon={DollarSign} color="#f59e0b" />
        <StatCard title="Total Paid" value={formatCurrency(totalPaid)} icon={CheckCircle} color="#10b981" />
        <StatCard title="Overdue" value={overdue} icon={AlertTriangle} color="#ef4444" />
        <StatCard title="Pending" value={pendingCount} icon={Clock} color="#3b82f6" />
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['', 'Pending', 'Paid', 'Overdue'].map((s) => {
          const label = s || 'All';
          const isActive = statusFilter === s;
          return (
            <Chip
              key={label}
              label={label}
              onClick={() => setStatusFilter(s)}
              sx={{
                fontWeight: isActive ? 700 : 500,
                bgcolor: isActive ? (isDark ? '#2dd4bf' : '#1a3a4a') : (isDark ? '#334155' : '#f1f5f9'),
                color: isActive ? '#fff' : '#475569',
                '&:hover': { bgcolor: isActive ? (isDark ? '#2dd4bf' : '#1a3a4a') : (isDark ? '#475569' : '#e2e8f0') }
              }}
            />
          );
        })}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by invoice # or order #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={16} color="#94a3b8" /></InputAdornment>
          }}
          sx={{ width: 350 }}
        />
      </Box>

      <DataTable columns={columns} rows={filtered} emptyMessage="No invoices found" />

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {filtered.length} of {all.length} invoices
        </Typography>
      </Box>
    </Box>
  );
}
