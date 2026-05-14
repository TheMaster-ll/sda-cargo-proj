<<<<<<< HEAD
import React from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Divider, Alert, useTheme
} from '@mui/material';
import { Scale, FileText, Database, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing or using the CargoPort platform, you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between your organization and CargoPort Systems.',
      'We reserve the right to modify these terms at any time. Operational updates will be communicated via the System Notification channel at least 72 hours prior to implementation.'
    ]
  },
  {
    id: 'responsibilities',
    title: '2. Operator Responsibilities',
    paragraphs: [
      'System operators are responsible for maintaining the confidentiality of their account credentials. All actions performed under a specific credential set are the sole responsibility of the credential holder.'
    ],
    checklist: [
      'Real-time monitoring of fleet telematics is required during active shifts.',
      'Reporting any hardware latency exceeding 500ms to Terminal A-14 support.',
      'Ensuring cargo documentation matches physical shipment contents.'
    ]
  },
  {
    id: 'data-usage',
    title: '3. Data Usage & Telemetry',
    subsections: [
      { label: 'Telemetry Processing', desc: 'CargoPort processes real-time GPS, fuel consumption, and engine diagnostics to optimize routing. This data remains the property of the fleet owner but is licensed to CargoPort for platform optimization.' },
      { label: 'Security Protocols', desc: 'All data transmissions are secured using enterprise-grade encryption. Access logs are audited every 24 hours to ensure protocol compliance and prevent unauthorized route alterations.' }
    ]
  },
  {
    id: 'service-levels',
    title: '4. Service Level Agreements',
    paragraphs: [
      'CargoPort guarantees 99.5% platform uptime for Professional and Enterprise plan customers. Scheduled maintenance windows are communicated 48 hours in advance. Any unplanned downtime exceeding 30 minutes triggers automatic SLA credit calculations.'
    ]
  },
  {
    id: 'liability',
    title: '5. Limitation of Liability',
    paragraphs: [
      'CargoPort acts as a logistics management platform connecting shippers and carriers. We are not liable for the physical handling, loss, or damage of cargo during transit. Carrier partners maintain their own insurance coverage as required by Pakistani transport regulations.',
      'Our maximum liability for any claim related to platform services is limited to the fees paid by the claimant in the 12 months preceding the claim.'
    ]
  },
  {
    id: 'termination',
    title: '6. Termination',
    paragraphs: [
      'Either party may terminate this agreement with 30 days written notice. CargoPort reserves the right to suspend accounts that violate these terms immediately and without prior notice. Upon termination, your data will be retained for 90 days, after which it will be permanently deleted.'
    ]
  }
];

const navTabs = [
  { id: 'acceptance', label: 'Operational Limits' },
  { id: 'data-usage', label: 'Data Sovereignty' },
  { id: 'liability', label: 'Fleet Liability' }
];
=======
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Divider, Alert, CircularProgress, useTheme } from '@mui/material';
import { Scale, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98

export default function TermsOfServiceContent() {
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
    api.get('/policies/terms')
      .then(({ data }) => { if (data.success) setSections(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(`terms-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Scale size={20} color={isDark ? '#2dd4bf' : '#f59e0b'} />
          <Typography variant="overline" sx={{ color: isDark ? '#2dd4bf' : '#f59e0b', fontWeight: 700 }}>LEGAL COMPLIANCE</Typography>
        </Box>
        <Typography variant="h4" fontWeight={800}>Terms of Service</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please review the operational agreements and legal frameworks governing the CargoPort platform. Last updated: May 10, 2026.
        </Typography>
      </Box>

<<<<<<< HEAD
      {/* Quick nav tabs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {navTabs.map((tab) => (
          <Chip
            key={tab.id}
            label={tab.label}
            onClick={() => scrollToSection(tab.id)}
=======
      {/* Quick nav chips */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {sections.slice(0, 4).map((s) => (
          <Chip
            key={s.sectionid}
            label={s.title}
            onClick={() => scrollToSection(s.sectionid)}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
            variant="outlined"
            sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { bgcolor: isDark ? '#334155' : '#f1f5f9' } }}
          />
        ))}
      </Box>

      {/* Important update banner */}
      <Alert
        severity="warning"
        icon={<AlertTriangle size={20} />}
        sx={{ mb: 4, borderRadius: 2, bgcolor: isDark ? '#065f46' : '#fef3c7', border: `1px solid ${isDark ? '#2dd4bf' : '#f59e0b'}` }}
      >
        <Typography variant="body2" fontWeight={600}>
          IMPORTANT UPDATE: As of May 2026, all international shipping operations are subject to the revised Customs Liability Charter.
        </Typography>
      </Alert>

      {/* Sections */}
<<<<<<< HEAD
      {sections.map((section) => (
        <Box key={section.id} id={section.id} sx={{ mb: 5, scrollMarginTop: '100px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, borderLeft: `3px solid ${isDark ? '#2dd4bf' : '#f59e0b'}`, pl: 2 }}>
            {section.title}
          </Typography>

          {section.paragraphs?.map((p, i) => (
            <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 1.5, pl: 2.5 }}>
              {p}
            </Typography>
          ))}

          {section.checklist && (
            <Box sx={{ pl: 2.5 }}>
              {section.checklist.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <CheckCircle size={16} color="#22c55e" style={{ marginTop: 3, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">{item}</Typography>
                </Box>
              ))}
            </Box>
          )}

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
        </Box>
      ))}

      {/* Acknowledgment bar */}
=======
      {sections.map((section, i) => (
        <Box key={section.sectionid} id={`terms-${section.sectionid}`} sx={{ mb: 5, scrollMarginTop: '100px' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, borderLeft: `3px solid ${isDark ? '#2dd4bf' : '#f59e0b'}`, pl: 2 }}>
            {i + 1}. {section.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, pl: 2.5, lineHeight: 1.8 }}>
            {section.content}
          </Typography>
        </Box>
      ))}

      {/* Footer cards */}
>>>>>>> 4335c1f75fd7cb0f58bf51fdf229c13149ebca98
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Scale size={24} color={isDark ? '#94a3b8' : '#1a3a4a'} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>Legal Inquiry</Typography>
            <Typography variant="caption" color="text.secondary">Contact our legal team for compliance clarification.</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ borderRadius: 2, flex: 1, minWidth: 200 }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Clock size={24} color={isDark ? '#94a3b8' : '#1a3a4a'} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>Version History</Typography>
            <Typography variant="caption" color="text.secondary">View the complete archive of terms and amendments.</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
