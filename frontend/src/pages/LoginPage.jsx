import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Checkbox, FormControlLabel, Link as MuiLink, CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { ROLE_DASHBOARD_ROUTES } from '../utils/constants';
import toast from 'react-hot-toast';
import { Truck, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import truckDark from '../assets/truck-dark.json';

const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        toast.success(t('login.welcomeBackToast'));
        const route = ROLE_DASHBOARD_ROUTES[response.data.user.role] || '/';
        navigate(route);
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '45%',
          bgcolor: '#f59e0b',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: 6
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Lottie animationData={truckDark} loop style={{ width: 56, height: 56 }} />
          <Typography variant="h5" fontWeight={800} color="#0f172a">CargoPort</Typography>
        </Box>
        <Lottie animationData={truckDark} loop style={{ width: 220, height: 220, margin: '0 auto 16px' }} />
        <Typography variant="h4" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
          {t('login.welcomeBack')}
        </Typography>
        <Typography color="#0f172a" sx={{ opacity: 0.8 }}>
          {t('login.streamline')}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#8898aa', p: 4 }}>
        <Card sx={{ width: '100%', maxWidth: 540, borderRadius: 3 }}>
          <CardContent sx={{ p: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="h3" fontWeight={700}>
                {t('login.signInTitle')}
              </Typography>
              <Button
                component={Link}
                to="/"
                startIcon={<ArrowLeft size={16} />}
                sx={{ color: '#64748b', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                {t('login.backToHome')}
              </Button>
            </Box>
            <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary', mb: 4 }}>
              {t('login.enterDetails')}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 500, mb: 0.5 }}>{t('login.emailOrUsername')}</Typography>
              <TextField
                fullWidth
                type="text"
                autoComplete="username"
                placeholder="dispatch@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3, '& .MuiInputBase-input': { fontSize: '1.1rem', py: 1.8 } }}
              />

              <Typography sx={{ fontSize: '1.05rem', fontWeight: 500, mb: 0.5 }}>{t('login.password')}</Typography>
              <TextField
                fullWidth
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                sx={{ mb: 2, '& .MuiInputBase-input': { fontSize: '1.1rem', py: 1.8 } }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel control={<Checkbox />} label={<Typography sx={{ fontSize: '0.95rem' }}>{t('login.rememberMe')}</Typography>} />
                <MuiLink component={Link} to="/forgot-password" sx={{ fontSize: '0.95rem', color: '#3b82f6' }}>
                  {t('login.forgotPassword')}
                </MuiLink>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ py: 1.8, fontSize: '1.1rem', fontWeight: 600, bgcolor: '#1a3a4a', '&:hover': { bgcolor: '#0f2a36' }, mb: 2 }}
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : t('login.signInButton')}
              </Button>
            </form>

            <Typography sx={{ fontSize: '1rem', color: 'text.secondary', textAlign: 'center', mt: 2 }}>
              {t('login.newToCargoPort')}{' '}
              <MuiLink component={Link} to="/signup" sx={{ color: '#3b82f6', fontWeight: 600 }}>
                {t('login.createAccount')}
              </MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
