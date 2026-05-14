import React from 'react';
import { Box, Container, Typography, Button, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import PrivacyPolicyContent from '../components/legal/PrivacyPolicyContent';

const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={lightTheme}>
    <CssBaseline />
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Nav */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, py: 2, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Truck size={28} color="#f59e0b" />
          <Typography variant="h6" fontWeight={800}>CargoPort</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="text" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>Sign In</Button>
          <Button variant="contained" onClick={() => navigate('/signup')} sx={{ bgcolor: '#1a3a4a' }}>Get Started</Button>
        </Box>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <PrivacyPolicyContent />
      </Container>

      {/* Footer */}
      <Box sx={{ py: 3, bgcolor: '#0f172a', color: '#94a3b8', px: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Truck size={18} color="#f59e0b" />
            <Typography variant="body2" fontWeight={600} color="#fff">CargoPort TMS</Typography>
          </Box>
          <Typography variant="caption">Copyright 2026 CargoPort TMS. All rights reserved.</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" component={Link} to="/privacy-policy" sx={{ color: '#fff', textDecoration: 'none' }}>Privacy Policy</Typography>
            <Typography variant="caption" component={Link} to="/terms-of-service" sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Terms of Service</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
