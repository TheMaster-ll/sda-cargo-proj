import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar, Chip, IconButton, Divider, useTheme } from '@mui/material';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import { formatDate } from '../../utils/helpers';
import { getInitials } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Mail, Phone, Building2, Calendar, Clock, Shield, Edit3, Save, X, Link2 } from 'lucide-react';

export default function CarrierProfilePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const c = theme.palette.custom;

  const { data: profile, refetch } = useFetch('/users/me');
  const p = profile || {};

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '', linkedin: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        linkedin: profile.linkedin || 'https://www.linkedin.com/in/muhammad-zeeshan-nazar-97b468a3?utm_source=share_via&utm_content=profile&utm_medium=member_android'
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', form);
      toast.success('Profile updated');
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      phone: p.phone || '',
      bio: p.bio || '',
      linkedin: p.linkedin || ''
    });
    setEditing(false);
  };

  const displayLinkedin = p.linkedin || 'https://www.linkedin.com/in/muhammad-zeeshan-nazar-97b468a3';

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Your account information" />

      {/* Profile Header Card */}
      <Card sx={{ mb: 3, overflow: 'visible' }}>
        <Box sx={{ height: 120, bgcolor: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1a7a7a 100%)' : 'linear-gradient(135deg, #1a3a4a 0%, #2563eb 100%)', background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1a7a7a 100%)' : 'linear-gradient(135deg, #1a3a4a 0%, #2563eb 100%)', borderRadius: '12px 12px 0 0' }} />
        <CardContent sx={{ pt: 0, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, mt: -5 }}>
            <Avatar
              sx={{
                width: 96, height: 96,
                bgcolor: c.primaryButton,
                fontSize: '2rem', fontWeight: 700,
                border: `4px solid ${isDark ? '#1e293b' : '#fff'}`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              {getInitials(`${p.firstName || ''} ${p.lastName || ''}`)}
            </Avatar>
            <Box sx={{ flex: 1, pb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  {p.firstName} {p.lastName}
                </Typography>
                <Chip
                  label={p.role}
                  size="small"
                  sx={{
                    bgcolor: isDark ? '#1a7a7a30' : '#e0f2fe',
                    color: isDark ? '#2dd4bf' : '#0369a1',
                    fontWeight: 600, fontSize: '0.75rem'
                  }}
                />
                {p.isActive && (
                  <Chip
                    label="Active"
                    size="small"
                    sx={{ bgcolor: isDark ? '#052e1680' : '#d1fae5', color: isDark ? '#6ee7b7' : '#047857', fontWeight: 600, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                @{p.username || 'user'}
                {p.companyName && ` · ${p.companyName}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, pb: 0.5 }}>
              {displayLinkedin && (
                <IconButton
                  component="a"
                  href={displayLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    bgcolor: '#0a66c2',
                    color: '#fff',
                    width: 36, height: 36,
                    '&:hover': { bgcolor: '#004182' }
                  }}
                >
                  <Link2 size={18} />
                </IconButton>
              )}
              {!editing ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit3 size={15} />}
                  onClick={() => setEditing(true)}
                  sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', color: 'text.primary' }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="small" startIcon={<X size={15} />} onClick={handleCancel} sx={{ color: 'text.secondary' }}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Save size={15} />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ bgcolor: c.primaryButton, '&:hover': { bgcolor: c.primaryButtonHover } }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Bio Section */}
          <Box sx={{ mt: 2.5, ml: 0.5 }}>
            {editing ? (
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                label="Bio"
                placeholder="Write a short bio about yourself..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 1 }}
              />
            ) : (
              <Typography variant="body2" color={p.bio ? 'text.primary' : 'text.secondary'} sx={{ lineHeight: 1.7 }}>
                {p.bio || 'No bio added yet. Click Edit Profile to add one.'}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Personal Information */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>Personal Information</Typography>

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth label="First Name" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Last Name" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </Box>
                <TextField
                  fullWidth label="Phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <TextField
                  fullWidth label="LinkedIn URL" value={form.linkedin}
                  placeholder="https://linkedin.com/in/your-profile"
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InfoRow icon={Mail} label="Email" value={p.email} isDark={isDark} />
                <InfoRow icon={Phone} label="Phone" value={p.phone || 'Not set'} isDark={isDark} />
                {p.companyName && <InfoRow icon={Building2} label="Company" value={p.companyName} isDark={isDark} />}
                <InfoRow icon={Link2} label="LinkedIn" value={displayLinkedin ? 'Connected' : 'Not linked'} isDark={isDark}
                  href={displayLinkedin} />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>Account Details</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <InfoRow icon={Shield} label="Role" value={p.role} isDark={isDark} />
              <InfoRow icon={Calendar} label="Member Since" value={formatDate(p.createdAt)} isDark={isDark} />
              <InfoRow icon={Clock} label="Last Login" value={p.lastLogin ? formatDate(p.lastLogin) : 'Never'} isDark={isDark} />

              <Divider sx={{ my: 0.5 }} />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>User ID</Typography>
                <Chip label={`#${p.id || '—'}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
              </Box>
              {p.username && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Username</Typography>
                  <Chip label={`@${p.username}`} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function InfoRow({ icon: Icon, label, value, isDark, href }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 2,
        bgcolor: isDark ? '#1e293b' : '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={16} color={isDark ? '#94a3b8' : '#64748b'} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        {href ? (
          <Typography
            variant="body2" fontWeight={500}
            component="a" href={href} target="_blank" rel="noopener noreferrer"
            sx={{ display: 'block', color: '#0a66c2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {value}
          </Typography>
        ) : (
          <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
        )}
      </Box>
    </Box>
  );
}
