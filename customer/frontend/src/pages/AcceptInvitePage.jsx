import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, LinearProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];

export default function AcceptInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/users/accept-invite/${token}`, { password });
      if (data.success) {
        setSuccess(true);
        toast.success('Account activated!');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. The invite link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', py: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Truck size={24} color="#f59e0b" />
            <Typography variant="h6" fontWeight={700}>CargoPort</Typography>
          </Box>

          {success ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle size={64} color="#22c55e" />
              <Typography variant="h5" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Account Activated!</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Your password has been set. You can now sign in to your dashboard.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ bgcolor: '#1a3a4a', py: 1.2 }}
              >
                Go to Sign In
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Set Your Password</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You've been invited to join CargoPort. Create a password to activate your account.
              </Typography>

              {error && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                  <AlertCircle size={18} color="#ef4444" />
                  <Typography variant="body2" color="error">{error}</Typography>
                </Box>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 1 }}
                />
                {password && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={strength * 20}
                      sx={{
                        height: 6, borderRadius: 3, mb: 0.5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { bgcolor: strengthColors[strength], borderRadius: 3 }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: strengthColors[strength], fontWeight: 600 }}>
                      {strengthLabels[strength]}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ py: 1.2, bgcolor: '#1a3a4a' }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : 'Activate Account'}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
