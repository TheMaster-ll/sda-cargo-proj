import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, ToggleButton, ToggleButtonGroup,
  Checkbox, FormControlLabel, Link as MuiLink, CircularProgress, ThemeProvider, createTheme
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '../services/authService';
import toast from 'react-hot-toast';
import { Truck, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import truckAnimation from '../assets/truck-animation.json';
import truckDark from '../assets/truck-dark.json';
import truckTeal from '../assets/truck-teal.json';

const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    companyName: '', password: '', confirmPassword: '', role: 'Customer'
  });
  const [agree, setAgree] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error(t('signup.passwordsMismatch'));
    }
    if (!agree) return toast.error(t('signup.pleaseAgree'));
    setLoading(true);
    try {
      const res = await register(form);
      if (res.success) {
        toast.success(res.message || 'Account created! Check your email.');
        navigate('/login');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <style>{`
        @keyframes truckRace1 { 0% { transform: translateX(-120px); } 50% { transform: translateX(120px); } 100% { transform: translateX(-120px); } }
        @keyframes truckRace2 { 0% { transform: translateX(-80px); } 50% { transform: translateX(160px); } 100% { transform: translateX(-80px); } }
        @keyframes truckRace3 { 0% { transform: translateX(-140px); } 50% { transform: translateX(100px); } 100% { transform: translateX(-140px); } }
      `}</style>

      {/* Left branded panel */}
      <Box sx={{
        width: '42%', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)',
        display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 6
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Lottie animationData={truckDark} loop style={{ width: 56, height: 56 }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: '#475569' }}>
            Cargo<span style={{ color: '#334155' }}>Port</span>
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#475569', textAlign: 'center', mb: 2 }}>
          {t('signup.createYourAccount')}
        </Typography>
        <Typography sx={{ color: '#475569', textAlign: 'center', mb: 4, maxWidth: 320 }}>
          {t('signup.chooseRole')}
        </Typography>

        {/* Racing trucks */}
        <Box sx={{ overflow: 'hidden', width: '100%', maxWidth: 360, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Box sx={{ animation: 'truckRace1 3s ease-in-out infinite' }}>
              <Lottie animationData={truckAnimation} loop style={{ width: 72, height: 72 }} />
            </Box>
            <Box sx={{ animation: 'truckRace2 2.5s ease-in-out infinite' }}>
              <Lottie animationData={truckDark} loop style={{ width: 72, height: 72 }} />
            </Box>
            <Box sx={{ animation: 'truckRace3 3.5s ease-in-out infinite' }}>
              <Lottie animationData={truckTeal} loop style={{ width: 72, height: 72 }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { val: '500+', label: 'Carriers' },
            { val: '50K+', label: 'Shipments' },
            { val: '99.5%', label: 'Uptime' }
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#475569' }}>{s.val}</Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right form panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lottie animationData={truckAnimation} loop style={{ width: 36, height: 36 }} />
              <Typography variant="h6" fontWeight={800}>Cargo<span style={{ color: '#f59e0b' }}>Port</span></Typography>
            </Box>
            <Button
              component={Link}
              to="/"
              startIcon={<ArrowLeft size={16} />}
              sx={{ color: '#64748b', textTransform: 'none', fontWeight: 500, '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              {t('login.backToHome')}
            </Button>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>{t('signup.createYourAccount')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('signup.chooseRole')}</Typography>

          <ToggleButtonGroup
            value={form.role}
            exclusive
            onChange={(e, val) => val && setForm({ ...form, role: val })}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="Customer">{t('signup.customer')}</ToggleButton>
            <ToggleButton value="CarrierPartner">{t('signup.carrierPartner')}</ToggleButton>
          </ToggleButtonGroup>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField fullWidth label={t('signup.firstName')} required value={form.firstName} onChange={handleChange('firstName')} />
              <TextField fullWidth label={t('signup.lastName')} required value={form.lastName} onChange={handleChange('lastName')} />
            </Box>
            <TextField fullWidth label={t('signup.email')} type="email" required value={form.email} onChange={handleChange('email')} sx={{ mb: 2 }} />
            <TextField fullWidth label={t('signup.phone')} value={form.phone} onChange={handleChange('phone')} sx={{ mb: 2 }} />
            <TextField fullWidth label={t('signup.companyName')} required value={form.companyName} onChange={handleChange('companyName')} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField fullWidth label={t('signup.password')} type="password" required value={form.password} onChange={handleChange('password')} />
              <TextField fullWidth label={t('signup.confirmPassword')} type="password" required value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
            </Box>

            <FormControlLabel
              control={<Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} size="small" />}
              label={<Typography variant="caption">{t('signup.agreeTerms')}</Typography>}
              sx={{ mb: 2 }}
            />

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.2, bgcolor: '#1a3a4a' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : t('signup.createAccountBtn')}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            {t('signup.alreadyHaveAccount')}{' '}
            <MuiLink component={Link} to="/login" sx={{ color: '#3b82f6', fontWeight: 600 }}>{t('signup.signInLink')}</MuiLink>
          </Typography>
        </CardContent>
      </Card>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
