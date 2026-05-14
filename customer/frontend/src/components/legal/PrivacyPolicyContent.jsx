<<<<<<< HEAD
import React from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, useTheme } from '@mui/material';
import { Shield, Lock, Eye, UserCheck, Mail } from 'lucide-react';

const sections = [
  {
    id: 'data-collection',
    title: '1. Data Collection & Usage',
    content: 'We collect specific categories of data necessary for the operation of the CargoPort platform. This includes real-time GPS coordinates for fleet status, terminal access logs, and shipment metadata.',
    subsections: [
      { label: 'Operational Data', desc: 'Shipment records, carrier performance metrics, and route-level telemetry used for predictive analytics.' },
      { label: 'Identity Data', desc: 'User accounts, authentication logs of sessions accessed, and terminal access credentials.' }
    ]
  },
  {
    id: 'security',
    title: '2. Security Measures',
    content: 'CargoPort employs enterprise-grade encryption for all data in transit and at rest. Our infrastructure is monitored 24/7 for unauthorized access attempts.',
    items: [
      { icon: Lock, label: 'AES-256 Encryption', desc: 'All shipment documentation and sensitive metadata are encrypted using industry-standard protocols.' },
      { icon: UserCheck, label: 'Multi-Factor Authentication', desc: 'Required for all dispatchers and fleet managers accessing the platform.' }
    ]
  },
  {
    id: 'sharing',
    title: '3. Data Sharing Protocols',
    content: 'CargoPort does not sell your personal data. We share operational data with carrier partners only to the extent necessary to fulfill shipment obligations. Aggregated, anonymized analytics may be used to improve our platform.'
  },
  {
    id: 'rights',
    title: '4. Your Rights',
    content: 'Under applicable Pakistani data protection laws and GDPR (where applicable), you have the right to access, correct, or delete your personal data. You may request a data export at any time through your account settings or by contacting support.'
  },
  {
    id: 'contact',
    title: '5. Contact & Support',
    content: 'For privacy-related inquiries, data export requests, or to exercise your data rights, please contact our Data Protection team at privacy@cargoport.pk or through the Help & Support section of your dashboard.'
  }
];

const navItems = [
  { id: 'data-collection', label: 'Data Collection' },
  { id: 'security', label: 'Security Measures' },
  { id: 'sharing', label: 'Sharing Protocols' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'contact', label: 'Contact & Support' }
];
=======
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, CircularProgress, useTheme } from '@mui/material';
import { Shield, Mail } from 'lucide-react';
import api from '../../services/api';
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98

export default function PrivacyPolicyContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
<<<<<<< HEAD
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

=======
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/policies/privacy')
      .then(({ data }) => { if (data.success) setSections(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(`privacy-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
<<<<<<< HEAD
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            &larr; Back
          </Typography>
=======
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
          <Typography variant="h4" fontWeight={800}>Privacy Policy</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            At CargoPort, we prioritize the security and confidentiality of your operational data. This policy outlines how we handle terminal telemetry, fleet logistics, and operator identity information.
          </Typography>
        </Box>
        <Chip
          icon={<Shield size={16} />}
          label="COMPLIANCE VERIFIED"
          sx={{ bgcolor: isDark ? '#2dd4bf' : '#f59e0b', color: '#000', fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Side nav */}
        <Box sx={{ width: { xs: '100%', md: 200 }, flexShrink: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>ON THIS PAGE</Typography>
<<<<<<< HEAD
          {navItems.map((item) => (
            <Typography
              key={item.id}
              variant="body2"
              onClick={() => scrollToSection(item.id)}
=======
          {sections.map((s) => (
            <Typography
              key={s.sectionid}
              variant="body2"
              onClick={() => scrollToSection(s.sectionid)}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
              sx={{
                display: 'block', py: 0.8, px: 1.5, cursor: 'pointer', borderRadius: 1,
                '&:hover': { bgcolor: isDark ? '#334155' : '#f1f5f9', color: isDark ? '#f1f5f9' : '#1a3a4a' },
                transition: 'all 0.2s'
              }}
            >
<<<<<<< HEAD
              {item.label}
=======
              {s.title}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
            </Typography>
          ))}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
<<<<<<< HEAD
          {sections.map((section) => (
            <Box key={section.id} id={section.id} sx={{ mb: 5, scrollMarginTop: '100px' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, borderLeft: `3px solid ${isDark ? '#2dd4bf' : '#f59e0b'}`, pl: 2 }}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2.5 }}>
                {section.content}
              </Typography>

              {section.subsections && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pl: 2.5 }}>
                  {section.subsections.map((sub) => (
                    <Card key={sub.label} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="overline" color="text.secondary">{sub.label}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{sub.desc}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {section.items && (
                <Box sx={{ pl: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {section.items.map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: isDark ? '#0f172a' : '#1a3a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={18} color={isDark ? '#2dd4bf' : '#f59e0b'} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
=======
          {sections.map((section, i) => (
            <Box key={section.sectionid} id={`privacy-${section.sectionid}`} sx={{ mb: 5, scrollMarginTop: '100px' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1, borderLeft: `3px solid ${isDark ? '#2dd4bf' : '#f59e0b'}`, pl: 2 }}>
                {i + 1}. {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2.5, lineHeight: 1.8 }}>
                {section.content}
              </Typography>
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
            </Box>
          ))}

          {/* Policy version history */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="overline" color="text.secondary">POLICY VERSION HISTORY</Typography>
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label="CURRENT" size="small" sx={{ bgcolor: '#22c55e', color: '#fff', fontSize: 10 }} />
              <Typography variant="body2" fontWeight={600}>May 2026 (v2.1)</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Updated data retention protocols for cross-border terminal shipments.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label="PREVIOUS" size="small" variant="outlined" sx={{ fontSize: 10 }} />
              <Typography variant="body2">March 2026 (v2.0)</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Initial implementation of the terminal-specific privacy framework.
            </Typography>
          </Box>

          {/* Data Export CTA */}
          <Card sx={{ mt: 4, bgcolor: isDark ? '#0f172a' : '#1a3a4a', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Mail size={20} color={isDark ? '#2dd4bf' : '#f59e0b'} />
                <Typography variant="subtitle1" fontWeight={700} color="#fff">Need a Data Export?</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Under GDPR and local regulations, you have the right to request a full archive of your operational data. The process typically takes 3-5 business days for validation.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
