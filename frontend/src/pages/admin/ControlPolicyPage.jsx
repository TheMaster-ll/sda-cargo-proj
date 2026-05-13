import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Tabs, Tab, Divider,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, useTheme
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';
import { Shield, FileText, HelpCircle, Save, Plus, Trash2, Edit2, Eye, GripVertical } from 'lucide-react';

const DEFAULT_PRIVACY = [
  { title: 'Data Collection & Usage', content: 'We collect specific categories of data necessary for the operation of the CargoPort platform. This includes real-time GPS coordinates for fleet status, terminal access logs, and shipment metadata.' },
  { title: 'Security Measures', content: 'CargoPort employs enterprise-grade encryption for all data in transit and at rest. Our infrastructure is monitored 24/7 for unauthorized access attempts.' },
  { title: 'Data Sharing Protocols', content: 'CargoPort does not sell your personal data. We share operational data with carrier partners only to the extent necessary to fulfill shipment obligations.' },
  { title: 'User Rights', content: 'Users have the right to request a full export of their operational data, request deletion of non-essential records, and opt out of non-critical analytics.' },
  { title: 'Contact', content: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@cargoport.pk.' }
];

const DEFAULT_TERMS = [
  { title: 'Acceptance of Terms', content: 'By accessing or using the CargoPort platform, you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between your organization and CargoPort Systems.' },
  { title: 'Operator Responsibilities', content: 'System operators are responsible for maintaining the confidentiality of their account credentials. All actions performed under a specific credential set are the sole responsibility of the credential holder.' },
  { title: 'Service Availability', content: 'CargoPort targets 99.9% uptime for all core services. Scheduled maintenance windows will be communicated at least 72 hours in advance via System Notifications.' },
  { title: 'Liability & Disputes', content: 'CargoPort shall not be liable for delays caused by force majeure events, including natural disasters, government actions, or infrastructure failures beyond our control.' },
  { title: 'Termination', content: 'Either party may terminate this agreement with 30 days written notice. Upon termination, all operational data will be retained for 90 days before permanent deletion.' }
];

const DEFAULT_HELP = [
  { title: 'Getting Started', content: 'Welcome to CargoPort. To begin, log in with your credentials. Customers can create orders from the dashboard. Dispatchers manage assignments and carrier allocation. Carriers track and update shipment status.' },
  { title: 'Creating an Order', content: 'Navigate to Orders > Create New Order. Select pickup and delivery locations, enter cargo details (weight, pieces, commodity), and provide contact information. The system will calculate cost estimates automatically.' },
  { title: 'Tracking Shipments', content: 'Use the tracking code provided after carrier assignment. Visit the public tracking page at /track or use the tracking feature in your dashboard. Real-time updates are provided as carriers add checkpoints.' },
  { title: 'Billing & Payments', content: 'Invoices are generated automatically when a carrier is assigned. Customers can pay invoices from the Invoices page. Dispatchers can send payment reminders for overdue invoices.' },
  { title: 'Contact Support', content: 'For urgent issues, contact dispatch at support@cargoport.pk or call +92-21-1234567. For non-urgent queries, use the in-app notification system.' }
];

function loadSections(key, defaults) {
  try {
    const saved = localStorage.getItem(`cargoport-policy-${key}`);
    return saved ? JSON.parse(saved) : defaults;
  } catch { return defaults; }
}

function saveSections(key, sections) {
  localStorage.setItem(`cargoport-policy-${key}`, JSON.stringify(sections));
}

export default function ControlPolicyPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const [editIdx, setEditIdx] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const tabs = [
    { label: 'Privacy Policy', icon: Shield, key: 'privacy', defaults: DEFAULT_PRIVACY },
    { label: 'Terms of Service', icon: FileText, key: 'terms', defaults: DEFAULT_TERMS },
    { label: 'Help & Support', icon: HelpCircle, key: 'help', defaults: DEFAULT_HELP }
  ];

  const currentTab = tabs[activeTab];
  const [sections, setSections] = useState(() => ({
    privacy: loadSections('privacy', DEFAULT_PRIVACY),
    terms: loadSections('terms', DEFAULT_TERMS),
    help: loadSections('help', DEFAULT_HELP)
  }));

  const currentSections = sections[currentTab.key];

  const handleSave = () => {
    saveSections(currentTab.key, currentSections);
    toast.success(`${currentTab.label} saved`);
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditTitle(currentSections[idx].title);
    setEditContent(currentSections[idx].content);
  };

  const handleSaveEdit = () => {
    const updated = [...currentSections];
    updated[editIdx] = { title: editTitle, content: editContent };
    setSections({ ...sections, [currentTab.key]: updated });
    setEditIdx(null);
  };

  const handleDelete = (idx) => {
    const updated = currentSections.filter((_, i) => i !== idx);
    setSections({ ...sections, [currentTab.key]: updated });
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Both fields are required');
    const updated = [...currentSections, { title: newTitle, content: newContent }];
    setSections({ ...sections, [currentTab.key]: updated });
    setNewTitle('');
    setNewContent('');
    setAddDialog(false);
  };

  const handleReset = () => {
    setSections({ ...sections, [currentTab.key]: currentTab.defaults });
    localStorage.removeItem(`cargoport-policy-${currentTab.key}`);
    toast.success('Reset to defaults');
  };

  return (
    <Box>
      <PageHeader title="Control Policy" subtitle="Manage platform policies and help documentation" />

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setEditIdx(null); setPreviewMode(false); }}
          sx={{
            px: 2, pt: 1,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' },
            '& .Mui-selected': { color: isDark ? '#2dd4bf' : '#1a3a4a' },
            '& .MuiTabs-indicator': { bgcolor: isDark ? '#2dd4bf' : '#1a3a4a' }
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.key} icon={<t.icon size={16} />} iconPosition="start" label={t.label} />
          ))}
        </Tabs>
      </Card>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={previewMode ? 'contained' : 'outlined'}
            startIcon={<Eye size={14} />}
            onClick={() => setPreviewMode(!previewMode)}
            sx={previewMode
              ? { bgcolor: isDark ? '#1a7a7a' : '#1a3a4a', color: '#fff', textTransform: 'none' }
              : { borderColor: isDark ? '#475569' : '#cbd5e1', color: isDark ? '#e2e8f0' : '#475569', textTransform: 'none' }
            }
          >
            {previewMode ? 'Editing' : 'Preview'}
          </Button>
          <Button size="small" variant="outlined" onClick={handleReset}
            sx={{ borderColor: isDark ? '#475569' : '#cbd5e1', color: isDark ? '#e2e8f0' : '#475569', textTransform: 'none' }}>
            Reset to Default
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={() => setAddDialog(true)}
            sx={{ borderColor: isDark ? '#2dd4bf' : '#1a3a4a', color: isDark ? '#2dd4bf' : '#1a3a4a', textTransform: 'none' }}>
            Add Section
          </Button>
          <Button size="small" variant="contained" startIcon={<Save size={14} />} onClick={handleSave}
            sx={{ bgcolor: isDark ? '#1a7a7a' : '#1a3a4a', textTransform: 'none', '&:hover': { bgcolor: isDark ? '#115e5e' : '#0f2a36' } }}>
            Publish Changes
          </Button>
        </Box>
      </Box>

      {/* Sections */}
      {previewMode ? (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: isDark ? '#f1f5f9' : '#0f172a' }}>
              {currentTab.label}
            </Typography>
            {currentSections.map((section, i) => (
              <Box key={i} sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  {i + 1}. {section.title}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.8 }}>
                  {section.content}
                </Typography>
                {i < currentSections.length - 1 && <Divider sx={{ mt: 3, borderColor: isDark ? '#334155' : '#e2e8f0' }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : (
        currentSections.map((section, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              {editIdx === i ? (
                <Box>
                  <TextField
                    fullWidth label="Section Title" value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ sx: { color: isDark ? '#94a3b8' : undefined } }}
                  />
                  <TextField
                    fullWidth multiline rows={4} label="Content" value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ sx: { color: isDark ? '#94a3b8' : undefined } }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={() => setEditIdx(null)}
                      sx={{ textTransform: 'none', color: isDark ? '#94a3b8' : '#64748b' }}>
                      Cancel
                    </Button>
                    <Button size="small" variant="contained" onClick={handleSaveEdit}
                      sx={{ bgcolor: isDark ? '#1a7a7a' : '#1a3a4a', textTransform: 'none' }}>
                      Save
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Chip label={i + 1} size="small" sx={{
                    bgcolor: isDark ? '#334155' : '#f1f5f9',
                    color: isDark ? '#e2e8f0' : '#475569',
                    fontWeight: 700, mt: 0.3
                  }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                      {section.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, color: isDark ? '#cbd5e1' : '#64748b', lineHeight: 1.7 }}>
                      {section.content.length > 200 ? section.content.slice(0, 200) + '...' : section.content}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => handleEdit(i)}
                      sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      <Edit2 size={15} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(i)}
                      sx={{ color: '#ef4444' }}>
                      <Trash2 size={15} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Add Section Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Add New Section</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Section Title" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth multiline rows={5} label="Content" value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}
            sx={{ bgcolor: isDark ? '#1a7a7a' : '#1a3a4a' }}>
            Add Section
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
