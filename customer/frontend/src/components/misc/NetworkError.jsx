import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { WifiOff } from 'lucide-react';

export default function NetworkError({ onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
      <WifiOff size={64} color="#ef4444" />
      <Typography variant="h6" fontWeight={600}>Connection lost</Typography>
      <Typography variant="body2" color="text.secondary">Please check your internet connection and try again.</Typography>
      {onRetry && <Button variant="contained" onClick={onRetry} sx={{ mt: 1, bgcolor: '#1a3a4a' }}>Retry</Button>}
    </Box>
  );
}
