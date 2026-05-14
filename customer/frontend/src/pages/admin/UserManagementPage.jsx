import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Typography } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Send } from 'lucide-react';

export default function UserManagementPage() {
  const { data: users, refetch } = useFetch('/users');
  const [roleModal, setRoleModal] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: '', lastName: '', email: '', role: 'Dispatcher', companyName: ''
  });

  const handleChangeRole = async () => {
    try {
      await api.patch(`/users/${roleModal.id}/role`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      setRoleModal(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email) {
      return toast.error('Please fill in all required fields');
    }
    setInviteLoading(true);
    try {
      const { data } = await api.post('/users/invite', inviteForm);
      if (data.success) {
        toast.success(data.message);
        setInviteModal(false);
        setInviteForm({ firstName: '', lastName: '', email: '', role: 'Dispatcher', companyName: '' });
        refetch();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResendInvite = async (userId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/users/${userId}/resend-invite`);
      toast.success('Invite resent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend invite');
    }
  };

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role', render: (r) => <StatusBadge status={r.role} /> },
    { id: 'company', label: 'Company', render: (r) => r.company || '-' },
    {
      id: 'isActive', label: 'Status',
      render: (r) => {
        if (!r.emailVerified && !r.lastLogin) {
          return <Chip label="Invite Pending" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.75rem' }} />;
        }
        return <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />;
      }
    },
    { id: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? formatDate(r.lastLogin) : 'Never' },
    {
      id: 'actions', label: 'Actions', sortable: false,
      render: (r) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!r.emailVerified && !r.lastLogin ? (
            <Button size="small" variant="outlined" startIcon={<Send size={14} />} onClick={(e) => handleResendInvite(r.id, e)}>
              Resend
            </Button>
          ) : (
            <>
              <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); setRoleModal(r); setNewRole(r.role); }}>
                Change Role
              </Button>
              <Button size="small" color={r.isActive ? 'error' : 'success'} onClick={(e) => { e.stopPropagation(); handleToggleStatus(r.id); }}>
                {r.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </>
          )}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Manage all system users and roles"
        action={
          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={() => setInviteModal(true)}
            sx={{ bgcolor: '#1a3a4a' }}
          >
            Invite User
          </Button>
        }
      />
      <DataTable columns={columns} rows={users || []} emptyMessage="No users found" />

      {/* Change Role Dialog */}
      <Dialog open={!!roleModal} onClose={() => setRoleModal(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} sx={{ mt: 1 }}>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Dispatcher">Dispatcher</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="CarrierPartner">Carrier Partner</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleModal(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeRole} sx={{ bgcolor: '#1a3a4a' }}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteModal} onClose={() => setInviteModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Invite New User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send an invite email. The user will set their own password when they accept.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              required
              value={inviteForm.firstName}
              onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Last Name"
              required
              value={inviteForm.lastName}
              onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
            />
          </Box>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            required
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Role"
            value={inviteForm.role}
            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Dispatcher">Dispatcher</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="CarrierPartner">Carrier Partner</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Company Name (optional)"
            value={inviteForm.companyName}
            onChange={(e) => setInviteForm({ ...inviteForm, companyName: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviteLoading}
            startIcon={<Send size={16} />}
            sx={{ bgcolor: '#1a3a4a' }}
          >
            {inviteLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
