import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh', gap: 2 }}>
      <FileQuestion size={80} color="#cbd5e1" />
      <Typography variant="h4" fontWeight={700}>404</Typography>
      <Typography variant="h6" color="text.secondary">We can't find that page</Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, bgcolor: '#1a3a4a' }}>Go to Dashboard</Button>
    </Box>
  );
}
