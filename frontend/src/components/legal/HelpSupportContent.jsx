import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Chip, useTheme
} from '@mui/material';
import {
  Search, Phone, BookOpen, MessageSquare, ChevronDown,
  PlayCircle, Code, MapPin, Mail, Clock
} from 'lucide-react';

const supportChannels = [
  { icon: Phone, title: 'Need urgent help?', desc: '24/7 technical dispatch assistance for critical shipment disruptions.', cta: 'Contact Dispatch', color: '#ef4444' },
  { icon: BookOpen, title: 'Operational Guides', desc: 'Step-by-step documentation for fleet status and inventory management.', cta: 'Browse Docs', color: '#f59e0b' },
  { icon: MessageSquare, title: 'Community Forum', desc: 'Join discussions with other fleet managers about terminal efficiency.', cta: 'Enter Forum', color: '#3b82f6' }
];

const faqs = [
  {
    q: 'How do I expedite a shipment that is currently "Delayed"?',
    a: 'Navigate to your Shipments page, locate the specific shipment by ID, and contact your assigned dispatcher. The system will automatically notify the route dispatcher and prioritize the package for the next available fleet transit.'
  },
  {
    q: 'How do I update my company information?',
    a: 'Go to your Profile page from the sidebar menu. Click "Edit Profile" to update your company name, contact details, and operational preferences. Changes take effect immediately across all your orders.'
  },
  {
    q: 'What happens when a carrier rejects an assigned shipment?',
    a: 'The order returns to "Pending" status and the dispatcher is notified. The dispatcher can then reassign to another available carrier from the carrier network. The original carrier\'s rejection is logged for performance tracking.'
  },
  {
    q: 'How are shipping costs calculated?',
    a: 'Costs are calculated based on shipment weight, transport mode (Air for <500kg, Road for 500-5000kg, Sea for >5000kg), and the route distance between pickup and delivery locations. Rates are configured in the System Settings by administrators.'
  },
  {
    q: 'How do I track my shipment in real-time?',
    a: 'Open the Order Details page for your shipment. You\'ll see a tracking timeline showing all status updates from creation to delivery. Each status change includes a timestamp and any notes from the carrier or dispatcher.'
  },
  {
    q: 'What payment methods are supported for invoices?',
    a: 'Currently, CargoPort supports bank transfer and corporate billing. Invoices are generated automatically upon shipment delivery with a 30-day payment window. Payment status can be tracked from the Invoices page.'
  }
];

const resources = [
  { icon: PlayCircle, title: 'Video Tutorials', desc: 'Visual walkthroughs of common dispatcher tasks.', cta: 'Watch Now', href: 'https://www.youtube.com/watch?v=BBJa32lCaaY' },
  { icon: Code, title: 'User Guide', desc: 'Complete documentation for the CargoPort platform.', cta: 'View Docs', href: '/docs/user-guide.html' },
  { icon: MapPin, title: 'Getting Started', desc: 'Quick start guide for new users and first shipment.', cta: 'Read Guide', href: '/docs/getting-started.html' }
];

export default function HelpSupportContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Hero Header */}
      <Card sx={{ bgcolor: '#1a3a4a', borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} color="#ffffff" sx={{ color: '#ffffff !important' }}>
            CargoPort Support Center
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, mb: 3 }}>
            Find documentation, operational guides, and connect with technical support for your logistics operations.
          </Typography>
          <TextField
            fullWidth
            placeholder="Search for documentation, shipping codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#94a3b8" />
                </InputAdornment>
              ),
              sx: { bgcolor: '#fff', borderRadius: 2 }
            }}
            sx={{ maxWidth: 500 }}
          />
        </CardContent>
      </Card>

      {/* Support Channels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
        {supportChannels.map((ch) => (
          <Card key={ch.title} sx={{ borderRadius: 2, textAlign: 'center', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: ch.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <ch.icon size={24} color={ch.color} />
              </Box>
              <Typography variant="subtitle1" fontWeight={600}>{ch.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>{ch.desc}</Typography>
              <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>{ch.cta}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Frequently Asked Questions</Typography>
          <Chip label={`${filteredFaqs.length} of ${faqs.length} results`} size="small" variant="outlined" />
        </Box>

        {filteredFaqs.map((faq, i) => (
          <Accordion
            key={i}
            expanded={expanded === i}
            onChange={() => setExpanded(expanded === i ? false : i)}
            sx={{ borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' }, boxShadow: 'none', border: '1px solid #e2e8f0' }}
          >
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography variant="subtitle2" fontWeight={600}>{faq.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}

        {filteredFaqs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">No results found for "{searchQuery}". Try different keywords.</Typography>
          </Box>
        )}
      </Box>

      {/* Resources */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Resources</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
        {resources.map((r) => (
          <Card key={r.title} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <r.icon size={28} color={isDark ? '#94a3b8' : '#1a3a4a'} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1.5, mb: 0.5 }}>{r.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{r.desc}</Typography>
              <Typography
                variant="body2"
                component="a"
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {r.cta}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Contact bar */}
      <Card sx={{ bgcolor: isDark ? '#1e293b' : '#f8fafc', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Still need help?</Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mail size={18} color={isDark ? '#94a3b8' : '#1a3a4a'} />
              <Typography variant="body2">support@cargoport.pk</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone size={18} color={isDark ? '#94a3b8' : '#1a3a4a'} />
              <Typography variant="body2">+92-21-111-CARGO</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Clock size={18} color={isDark ? '#94a3b8' : '#1a3a4a'} />
              <Typography variant="body2">Mon-Sat, 9 AM - 6 PM PKT</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
