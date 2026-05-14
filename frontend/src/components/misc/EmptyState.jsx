import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', subtitle, actionLabel, onAction }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
      <PackageOpen size={64} color="#cbd5e1" />
      <Typography variant="h6" fontWeight={600}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      {actionLabel && <Button variant="contained" onClick={onAction} sx={{ mt: 1, bgcolor: '#1a3a4a' }}>{actionLabel}</Button>}
    </Box>
  );
}
