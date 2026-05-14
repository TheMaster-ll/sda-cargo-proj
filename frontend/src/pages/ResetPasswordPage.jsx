import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, LinearProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import toast from 'react-hot-toast';

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#ef4444', '#f59e0b', '#10b981', '#059669'];

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        toast.success('Password reset successfully');
        navigate('/login');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>Reset your password</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Enter your new password below.</Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="New Password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 1 }}
            />
            {password && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={(strength / 5) * 100}
                  sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: strengthColors[strength] } }}
                />
                <Typography variant="caption" sx={{ color: strengthColors[strength], fontWeight: 600 }}>
                  {strengthLabels[strength]}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth label="Confirm Password" type="password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)} sx={{ mb: 3 }}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ py: 1.2, bgcolor: '#1a3a4a' }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
