import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Tabs, Tab, Divider,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, useTheme,
  CircularProgress
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Shield, FileText, HelpCircle, Save, Plus, Trash2, Edit2, Eye } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  const tabs = [
    { label: 'Privacy Policy', icon: Shield, key: 'privacy' },
    { label: 'Terms of Service', icon: FileText, key: 'terms' },
    { label: 'Help & Support', icon: HelpCircle, key: 'help' }
  ];

  const currentTab = tabs[activeTab];
  const [sections, setSections] = useState({ privacy: [], terms: [], help: [] });

  const fetchSections = async (type) => {
    try {
      const { data } = await api.get(`/policies/${type}`);
      if (data.success) {
        setSections((prev) => ({ ...prev, [type]: data.data }));
      }
    } catch {
      toast.error(`Failed to load ${type} sections`);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSections('privacy'), fetchSections('terms'), fetchSections('help')]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const currentSections = sections[currentTab.key];

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditTitle(currentSections[idx].title);
    setEditContent(currentSections[idx].content);
  };

  const handleSaveEdit = async () => {
    const section = currentSections[editIdx];
    try {
      await api.put(`/policies/${currentTab.key}/${section.sectionid}`, {
        title: editTitle,
        content: editContent
      });
      toast.success('Section updated');
      setEditIdx(null);
      fetchSections(currentTab.key);
    } catch {
      toast.error('Failed to update section');
    }
  };

  const handleDelete = async (idx) => {
    const section = currentSections[idx];
    try {
      await api.delete(`/policies/${currentTab.key}/${section.sectionid}`);
      toast.success('Section deleted');
      fetchSections(currentTab.key);
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Both fields are required');
    try {
      await api.post(`/policies/${currentTab.key}`, {
        title: newTitle,
        content: newContent
      });
      toast.success('Section added');
      setNewTitle('');
      setNewContent('');
      setAddDialog(false);
      fetchSections(currentTab.key);
    } catch {
      toast.error('Failed to add section');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<Plus size={14} />} onClick={() => setAddDialog(true)}
            sx={{ borderColor: isDark ? '#2dd4bf' : '#1a3a4a', color: isDark ? '#2dd4bf' : '#1a3a4a', textTransform: 'none' }}>
            Add Section
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
              <Box key={section.sectionid} sx={{ mb: 3 }}>
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
          <Card key={section.sectionid} sx={{ mb: 2 }}>
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
