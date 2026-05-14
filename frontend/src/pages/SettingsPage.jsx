import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Switch, Avatar,
  List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getInitials } from '../utils/helpers';
import { User, Shield, Globe, Palette, Lock, Smartphone, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();

  const tabs = [
    { id: 'profile', label: t('settingsPage.profileTab'), icon: User },
    { id: 'security', label: t('settingsPage.securityTab'), icon: Shield },
    { id: 'language', label: t('settingsPage.languageTab'), icon: Globe },
    { id: 'appearance', label: t('settingsPage.appearanceTab'), icon: Palette }
  ];
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Security state
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });

  // Appearance state
  const [theme, setTheme] = useState(() => localStorage.getItem('cargoport-theme') || 'light');

  // Language state
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [currency, setCurrency] = useState('PKR');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/users/me', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone
      });
      if (data.success) {
        toast.success('Profile updated');
        if (updateUser) {
          updateUser({
            ...user,
            firstName: profile.firstName,
            lastName: profile.lastName,
            name: `${profile.firstName} ${profile.lastName}`,
            phone: profile.phone
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    if (passwords.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const { data } = await api.put('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPassword
      });
      if (data.success) {
        toast.success('Password changed successfully');
        setPasswords({ current: '', newPassword: '', confirm: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('cargoport-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new CustomEvent('theme-change', { detail: newTheme }));
  };

  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const c = muiTheme.palette.custom;
  const roleLabel = user?.role === 'CarrierPartner' ? t('sidebar.carrierPartner') : user?.role;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>{t('settingsPage.title')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('settingsPage.subtitle')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Side tabs */}
        <Card sx={{ width: 220, flexShrink: 0, alignSelf: 'flex-start' }}>
          <List sx={{ p: 1 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <ListItem
                  key={tab.id}
                  button
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderRadius: 1.5, mb: 0.5, py: 1.2,
                    bgcolor: isActive ? c.primaryButton : 'transparent',
                    color: isActive ? '#fff' : 'text.primary',
                    '&:hover': { bgcolor: isActive ? c.primaryButton : c.inputBg },
                    cursor: 'pointer'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? c.accent : muiTheme.palette.text.secondary }}>
                    <tab.icon size={18} />
                  </ListItemIcon>
                  <ListItemText primary={tab.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400 }} />
                </ListItem>
              );
            })}
          </List>
        </Card>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>{t('settingsPage.profileInfo')}</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: c.inputBg, borderRadius: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: c.primaryButton, fontSize: '1.2rem', fontWeight: 700 }}>
                    {getInitials(user?.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{profile.firstName} {profile.lastName}</Typography>
                    <Typography variant="body2" color="text.secondary">{roleLabel}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth label={t('settingsPage.fullName')} value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                  <TextField
                    fullWidth label={t('settingsPage.lastName')} value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField fullWidth label={t('settingsPage.emailAddress')} value={profile.email} disabled />
                  <TextField
                    fullWidth label={t('settingsPage.phoneNumber')} value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </Box>
                <TextField fullWidth label={t('settingsPage.accountRole')} value={roleLabel} disabled sx={{ mb: 3 }} />

                <Divider sx={{ my: 2 }} />

                {/* Notification Preferences */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{t('settingsPage.notifPrefs')}</Typography>
                {[
                  { label: t('settingsPage.shipmentStatusChanges'), desc: t('settingsPage.shipmentStatusDesc'), defaultOn: true },
                  { label: t('settingsPage.deliveryConfirmations'), desc: t('settingsPage.deliveryConfDesc'), defaultOn: true },
                  { label: t('settingsPage.billingAlerts'), desc: t('settingsPage.billingAlertsDesc'), defaultOn: false },
                  { label: t('settingsPage.delayAlerts'), desc: t('settingsPage.delayAlertsDesc'), defaultOn: true }
                ].map((pref) => (
                  <Box key={pref.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>{pref.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{pref.desc}</Typography>
                    </Box>
                    <Switch defaultChecked={pref.defaultOn} color="warning" />
                  </Box>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button variant="outlined">{t('common.cancel')}</Button>
                  <Button variant="contained" onClick={handleSaveProfile} disabled={loading} sx={{ bgcolor: c.primaryButton, '&:hover': { bgcolor: c.primaryButtonHover } }}>
                    {loading ? <CircularProgress size={20} color="inherit" /> : t('common.save')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>{t('settingsPage.securityAccess')}</Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: c.inputBg, borderRadius: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Lock size={20} color={c.primaryButton} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{t('settingsPage.passwordMgmt')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('settingsPage.changePassword')}</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth label={t('settingsPage.currentPassword')} type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth label={t('settingsPage.newPassword')} type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    />
                    <TextField
                      fullWidth label={t('settingsPage.confirmNewPassword')} type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    disabled={loading || !passwords.current || !passwords.newPassword}
                    sx={{ bgcolor: c.primaryButton, '&:hover': { bgcolor: c.primaryButtonHover } }}
                  >
                    {loading ? <CircularProgress size={20} color="inherit" /> : t('settingsPage.changePasswordBtn')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Smartphone size={20} color="#3b82f6" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{t('settingsPage.twoFactor')}</Typography>
                        <Typography variant="caption" color="text.secondary">{t('settingsPage.twoFactorDesc')}</Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" size="small" sx={{ bgcolor: '#3b82f6' }}>{t('common.enable')}</Button>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>{t('settingsPage.activeSessions')}</Typography>
                  {[
                    { device: 'Windows PC - Chrome', location: t('settingsPage.currentSession'), active: true },
                    { device: 'iPhone 15 - Safari', location: '2 hours ago', active: false }
                  ].map((session, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Monitor size={18} color="#64748b" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{session.device}</Typography>
                          <Typography variant="caption" color="text.secondary">{session.location}</Typography>
                        </Box>
                      </Box>
                      {session.active ? (
                        <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>{t('settingsPage.activeNow')}</Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>{t('common.revoke')}</Typography>
                      )}
                    </Box>
                  ))}
                  <Typography
                    variant="body2"
                    sx={{ color: '#ef4444', fontWeight: 600, mt: 2, cursor: 'pointer', textAlign: 'center' }}
                  >
                    {t('settingsPage.signOutAll')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* LANGUAGE & REGION TAB */}
          {activeTab === 'language' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>{t('settingsPage.languageRegion')}</Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>{t('settingsPage.language')}</InputLabel>
                  <Select value={language} onChange={(e) => setLanguage(e.target.value)} label={t('settingsPage.language')}>
                    <MenuItem value="en">{t('settingsPage.english')}</MenuItem>
                    <MenuItem value="ur">{t('settingsPage.urdu')}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>{t('settingsPage.timezone')}</InputLabel>
                  <Select value={timezone} onChange={(e) => setTimezone(e.target.value)} label={t('settingsPage.timezone')}>
                    <MenuItem value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</MenuItem>
                    <MenuItem value="Europe/London">Europe/London (GMT/BST)</MenuItem>
                    <MenuItem value="America/New_York">America/New York (EST/EDT)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>{t('settingsPage.currency')}</InputLabel>
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)} label={t('settingsPage.currency')}>
                    <MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem>
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="AED">AED - UAE Dirham</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined">{t('common.cancel')}</Button>
                  <Button variant="contained" onClick={() => toast.success(t('settingsPage.prefsSaved'))} sx={{ bgcolor: c.primaryButton, '&:hover': { bgcolor: c.primaryButtonHover } }}>
                    {t('common.save')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t('settingsPage.appearance')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('settingsPage.customizeLook')}
                </Typography>

                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>{t('settingsPage.theme')}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  {[
                    { id: 'light', label: t('settingsPage.light'), icon: Sun, desc: t('settingsPage.lightDesc') },
                    { id: 'dark', label: t('settingsPage.dark'), icon: Moon, desc: t('settingsPage.darkDesc') }
                  ].map((themeOption) => (
                    <Card
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id)}
                      sx={{
                        flex: 1, cursor: 'pointer', p: 3, textAlign: 'center',
                        border: theme === themeOption.id ? `2px solid ${c.accent}` : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: 2,
                        bgcolor: themeOption.id === 'dark' ? '#0f172a' : '#fff',
                        '&:hover': { borderColor: c.accent },
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <themeOption.icon size={32} color={themeOption.id === 'dark' ? '#2dd4bf' : '#1a3a4a'} />
                      <Typography
                        variant="subtitle2" fontWeight={600}
                        sx={{ mt: 1.5, color: themeOption.id === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        {themeOption.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: themeOption.id === 'dark' ? '#94a3b8' : '#64748b' }}>
                        {themeOption.desc}
                      </Typography>
                      {theme === themeOption.id && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ color: c.accent, fontWeight: 700 }}>{t('settingsPage.activeTheme')}</Typography>
                        </Box>
                      )}
                    </Card>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>{t('settingsPage.sidebarDensity')}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {[t('settingsPage.compact'), t('settingsPage.comfortable'), t('settingsPage.spacious')].map((density) => (
                    <Card
                      key={density}
                      sx={{
                        flex: 1, p: 2, textAlign: 'center', cursor: 'pointer',
                        border: density === t('settingsPage.comfortable') ? `2px solid ${c.accent}` : `2px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: 2,
                        '&:hover': { borderColor: '#f59e0b' }
                      }}
                    >
                      <Typography variant="body2" fontWeight={density === t('settingsPage.comfortable') ? 700 : 400}>{density}</Typography>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
