import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, Link as MuiLink, ThemeProvider, createTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../services/authService';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success(t('forgotPw.linkSentToast'));
    } catch (err) {
      toast.error(t('forgotPw.failedToast'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {sent ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Mail size={48} color="#10b981" />
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>{t('forgotPw.checkEmail')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('forgotPw.sentLink')} <strong>{email}</strong>
              </Typography>
              <MuiLink component={Link} to="/login" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 3, color: '#3b82f6' }}>
                <ArrowLeft size={16} /> {t('forgotPw.backToLogin')}
              </MuiLink>
            </Box>
          ) : (
            <>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>{t('forgotPw.title')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('forgotPw.subtitle')}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth label={t('forgotPw.emailLabel')} type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3 }}
                />
                <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.2, bgcolor: '#1a3a4a' }}>
                  {loading ? <CircularProgress size={22} color="inherit" /> : t('forgotPw.sendLink')}
                </Button>
              </form>
              <MuiLink component={Link} to="/login" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 2, color: '#3b82f6', fontSize: '0.85rem' }}>
                <ArrowLeft size={16} /> {t('forgotPw.backToLogin')}
              </MuiLink>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
    </ThemeProvider>
  );
}
