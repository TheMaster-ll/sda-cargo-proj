import React from 'react';
import useAuth from '../hooks/useAuth';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !roles.includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <ShieldOff size={64} color="#ef4444" />
        <Typography variant="h5" fontWeight={600}>Access Denied</Typography>
        <Typography color="text.secondary">You don't have permission to view this page.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return children;
}
