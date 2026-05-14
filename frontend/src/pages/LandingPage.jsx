import React, { useRef, useState } from 'react';
import { Box, Typography, Button, Container, Card, CardContent, Divider, ThemeProvider, createTheme, TextField, InputAdornment, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck, BarChart3, Globe, Users, ArrowRight, CheckCircle,
  Shield, Headphones, Clock, MapPin, CreditCard, Star, ChevronRight, Search, Package, AlertTriangle
} from 'lucide-react';
import Lottie from 'lottie-react';
import truckAnimation from '../assets/truck-animation.json';
import truckDark from '../assets/truck-dark.json';
import api from '../services/api';
import { formatDateTime } from '../utils/helpers';
import { SHIPMENT_STATUS_ORDER } from '../utils/constants';

// Landing page always renders in light mode
const lightTheme = createTheme({ palette: { mode: 'light' } });

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [trackingCode, setTrackingCode] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const handleTrack = async () => {
    if (!trackingCode.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const { data } = await api.get(`/shipments/track/${trackingCode.trim()}`);
      if (data.success) setTrackResult(data.data);
    } catch {
      setTrackError(t('tracking.notFound'));
    } finally {
      setTrackLoading(false);
    }
  };

  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const carriersRef = useRef(null);
  const aboutRef = useRef(null);

  const features = [
    { icon: BarChart3, title: t('landing.smartCarrier'), desc: t('landing.smartCarrierDesc') },
    { icon: Truck, title: t('landing.realTimeTracking'), desc: t('landing.realTimeTrackingDesc') },
    { icon: Globe, title: t('landing.multiCurrency'), desc: t('landing.multiCurrencyDesc') },
    { icon: Users, title: t('landing.roleBased'), desc: t('landing.roleBasedDesc') }
  ];

  const pricingPlans = [
    {
      name: t('landing.starter'),
      price: t('landing.starterPrice'),
      period: '',
      desc: t('landing.starterDesc'),
      features: [t('landing.upTo50'), t('landing.basicTracking'), t('landing.oneUser'), t('landing.emailSupport')],
      cta: t('landing.getStarted'),
      highlighted: false
    },
    {
      name: t('landing.professional'),
      price: 'PKR 15,000',
      period: '/month',
      desc: t('landing.professionalDesc'),
      features: [t('landing.unlimitedOrders'), t('landing.realTimeTrackingFeature'), t('landing.upTo10Users'), t('landing.prioritySupport'), t('landing.analyticsDashboard'), t('landing.carrierNetworkAccess')],
      cta: t('landing.startFreeTrial'),
      highlighted: true
    },
    {
      name: t('landing.enterprise'),
      price: t('landing.enterprisePrice'),
      period: '',
      desc: t('landing.enterpriseDesc'),
      features: [t('landing.everythingInPro'), t('landing.unlimitedUsers'), t('landing.customIntegrations'), t('landing.dedicatedManager'), t('landing.slaGuarantees'), t('landing.onPremise')],
      cta: t('landing.contactSales'),
      highlighted: false
    }
  ];

  const carrierBenefits = [
    { icon: CreditCard, title: t('landing.reliablePayments'), desc: t('landing.reliablePaymentsDesc') },
    { icon: MapPin, title: t('landing.optimizedRoutes'), desc: t('landing.optimizedRoutesDesc') },
    { icon: Star, title: t('landing.buildReputation'), desc: t('landing.buildReputationDesc') },
    { icon: Clock, title: t('landing.reduceDowntime'), desc: t('landing.reduceDowntimeDesc') }
  ];

  const stats = [
    { value: '500+', label: t('landing.activeCarriers') },
    { value: '10,000+', label: t('landing.shipmentsDelivered') },
    { value: '98%', label: t('landing.onTimeDelivery') },
    { value: '50+', label: t('landing.citiesCovered') }
  ];

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ThemeProvider theme={lightTheme}>
    <Box sx={{ bgcolor: '#fff', color: '#0f172a' }}>
      {/* --- NAV BAR --- */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 4, py: 1.5, bgcolor: '#fff', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '3px solid #f59e0b'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Lottie animationData={truckAnimation} loop style={{ width: 48, height: 48 }} />
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1a3a4a' }}>Cargo<span style={{ color: '#f59e0b' }}>Port</span></Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {[
            { label: t('landing.features'), ref: featuresRef },
            { label: t('landing.pricing'), ref: pricingRef },
            { label: t('landing.carriers'), ref: carriersRef },
            { label: t('landing.about'), ref: aboutRef }
          ].map((item) => (
            <Typography
              key={item.label}
              variant="body2"
              onClick={() => scrollTo(item.ref)}
              sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { color: '#f59e0b' }, transition: 'color 0.2s' }}
            >
              {item.label}
            </Typography>
          ))}
          <Typography
            variant="body2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{ cursor: 'pointer', fontWeight: 600, color: '#f59e0b', '&:hover': { color: '#d97706' }, transition: 'color 0.2s' }}
          >
            {t('landing.trackShipment')}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ fontWeight: 600, bgcolor: '#f59e0b', color: '#000', '&:hover': { bgcolor: '#d97706' } }}>{t('landing.signIn')}</Button>
          <Button variant="contained" onClick={() => navigate('/signup')} sx={{ bgcolor: '#1a3a4a', '&:hover': { bgcolor: '#0f2a36' } }}>{t('landing.getStarted')}</Button>
        </Box>
      </Box>

      {/* --- HERO --- */}
      <Box sx={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)', py: { xs: 6, md: 10 }, px: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 320 }}>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2 }}>
                {t('landing.heroTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480 }}>
                {t('landing.heroSubtitle')}
              </Typography>
              <Lottie animationData={truckDark} loop style={{ width: 160, height: 160, marginBottom: 8 }} />
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={18} />}
                onClick={() => navigate('/signup')}
                sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}
              >
                {t('landing.startFreeTrial')}
              </Button>
            </Box>
            <Card sx={{ flex: 1, minWidth: 320, borderRadius: 3, boxShadow: 3, overflow: 'visible' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Package size={24} color="#1a3a4a" />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#1a3a4a' }}>{t('tracking.trackYourShipment')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('tracking.enterTrackingCode')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth size="small"
                    placeholder={t('tracking.placeholder')}
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search size={18} color="#94a3b8" /></InputAdornment>,
                      sx: { bgcolor: '#f8fafc', borderRadius: 2 }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleTrack}
                    disabled={trackLoading}
                    sx={{ bgcolor: '#1a3a4a', px: 3, borderRadius: 2, '&:hover': { bgcolor: '#0f2a36' } }}
                  >
                    {trackLoading ? <CircularProgress size={20} color="inherit" /> : t('tracking.trackBtn')}
                  </Button>
                </Box>

                {trackError && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <Typography variant="body2" sx={{ color: '#ef4444' }}>{trackError}</Typography>
                  </Box>
                )}

                {trackResult && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">{t('tracking.trackingCode')}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#1a3a4a' }}>{trackResult.trackingcode}</Typography>
                      </Box>
                      <Box sx={{
                        px: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                        bgcolor: trackResult.status === 'Delivered' ? '#d1fae5' : '#dbeafe',
                        color: trackResult.status === 'Delivered' ? '#047857' : '#1d4ed8'
                      }}>
                        {trackResult.status}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MapPin size={14} color="#64748b" />
                      <Typography variant="caption" color="text.secondary">
                        {trackResult.orders?.pickup?.city || '—'} → {trackResult.orders?.delivery?.city || '—'}
                      </Typography>
                    </Box>
                    <Stepper activeStep={SHIPMENT_STATUS_ORDER.indexOf(trackResult.status?.replace('InTransit', 'In Transit')?.replace('PickedUp', 'Picked Up'))} alternativeLabel sx={{ mt: 1 }}>
                      {SHIPMENT_STATUS_ORDER.map((label) => (
                        <Step key={label}><StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem' } }}>{label}</StepLabel></Step>
                      ))}
                    </Stepper>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* --- TRUSTED BY --- */}
      <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('landing.trustedBy')}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
          {['TechFlow', 'SpeedCargo', 'Global Traders', 'PackSmart'].map((name) => (
            <Typography key={name} variant="subtitle1" fontWeight={700} color="text.secondary">{name}</Typography>
          ))}
        </Box>
      </Box>

      {/* --- FEATURES SECTION --- */}
      <Box ref={featuresRef} sx={{ scrollMarginTop: '80px' }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{t('landing.everythingYouNeed')}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>{t('landing.builtSpecifically')}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {features.map((f) => (
              <Card key={f.title} sx={{ borderRadius: 2, '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <f.icon size={24} color="#f59e0b" />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- STATS --- */}
      <Box sx={{ bgcolor: '#1a3a4a', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4, textAlign: 'center' }}>
            {stats.map((s) => (
              <Box key={s.label}>
                <Typography variant="h3" fontWeight={800} sx={{ color: '#f59e0b' }}>{s.value}</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>{s.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- PRICING SECTION --- */}
      <Box ref={pricingRef} sx={{ py: 8, bgcolor: '#f8fafc', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{t('landing.simplePricing')}</Typography>
            <Typography variant="body1" color="text.secondary">{t('landing.noHiddenFees')}</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'stretch' }}>
            {pricingPlans.map((plan) => (
              <Card key={plan.name} sx={{
                borderRadius: 3,
                border: plan.highlighted ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'visible',
                '&:hover': { boxShadow: 6 },
                transition: 'box-shadow 0.2s'
              }}>
                {plan.highlighted && (
                  <Box sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', bgcolor: '#f59e0b', color: '#000', px: 2, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: 12 }}>
                    {t('landing.mostPopular')}
                  </Box>
                )}
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 2, mb: 1 }}>
                    <Typography variant="h4" fontWeight={800}>{plan.price}</Typography>
                    {plan.period && <Typography variant="body2" color="text.secondary">{plan.period}</Typography>}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{plan.desc}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    {plan.features.map((feat) => (
                      <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircle size={16} color="#22c55e" />
                        <Typography variant="body2">{feat}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    onClick={() => navigate('/signup')}
                    sx={plan.highlighted
                      ? { mt: 3, bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }
                      : { mt: 3, borderColor: '#1a3a4a', color: '#1a3a4a', fontWeight: 600 }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* --- CARRIERS SECTION --- */}
      <Box ref={carriersRef} sx={{ py: 8, scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 320 }}>
              <Typography variant="overline" sx={{ color: '#f59e0b', fontWeight: 700 }}>{t('landing.forCarrierPartners')}</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{t('landing.growFleet')}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {t('landing.joinNetwork')}
              </Typography>
              <Button
                variant="contained"
                endIcon={<ChevronRight size={18} />}
                onClick={() => navigate('/signup')}
                sx={{ bgcolor: '#1a3a4a', '&:hover': { bgcolor: '#0f2a36' } }}
              >
                {t('landing.joinAsCarrier')}
              </Button>
            </Box>
            <Box sx={{ flex: 1, minWidth: 320 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {carrierBenefits.map((b) => (
                  <Card key={b.title} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                        <b.icon size={20} color="#f59e0b" />
                      </Box>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>{b.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{b.desc}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* --- ABOUT SECTION --- */}
      <Box ref={aboutRef} sx={{ py: 8, bgcolor: '#f8fafc', scrollMarginTop: '80px' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>{t('landing.aboutCargoPort')}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              {t('landing.buildingBackbone')}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mb: 6 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Shield size={36} color="#1a3a4a" />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2, mb: 1 }}>{t('landing.ourMission')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('landing.ourMissionDesc')}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Globe size={36} color="#1a3a4a" />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2, mb: 1 }}>{t('landing.ourVision')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('landing.ourVisionDesc')}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Headphones size={36} color="#1a3a4a" />
                <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2, mb: 1 }}>{t('landing.ourSupport')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('landing.ourSupportDesc')}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ bgcolor: '#1a3a4a', borderRadius: 3, p: 5, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', mb: 1 }}>{t('landing.readyToStart')}</Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
              {t('landing.joinHundreds')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={18} />}
              onClick={() => navigate('/signup')}
              sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#d97706' } }}
            >
              {t('landing.createFreeAccount')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box sx={{ py: 4, bgcolor: '#0f172a', color: '#94a3b8', px: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Truck size={18} color="#f59e0b" />
              <Typography variant="body2" fontWeight={600} color="#fff">CargoPort TMS</Typography>
            </Box>
            <Typography variant="caption">{t('landing.copyright')}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" component={Link} to="/privacy-policy" sx={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>{t('sidebar.privacyPolicy')}</Typography>
              <Typography variant="caption" component={Link} to="/terms-of-service" sx={{ cursor: 'pointer', color: '#94a3b8', textDecoration: 'none', '&:hover': { color: '#fff' } }}>{t('sidebar.termsOfService')}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
    </ThemeProvider>
  );
}
