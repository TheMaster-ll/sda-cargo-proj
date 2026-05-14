import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, actionLabel, onAction, actionIcon: ActionIcon, breadcrumbs, action }) {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && (
        <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 1 }}>
          {breadcrumbs.map((crumb, i) => (
            i < breadcrumbs.length - 1 ? (
              <Link
                key={i}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: '0.82rem', cursor: 'pointer' }}
                onClick={() => navigate(crumb.path)}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: '0.82rem' }}>
                {crumb.label}
              </Typography>
            )
          ))}
        </Breadcrumbs>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>{subtitle}</Typography>}
        </Box>
        {action || (actionLabel && (
          <Button
            variant="contained"
            onClick={onAction}
            startIcon={ActionIcon ? <ActionIcon size={18} /> : null}
            sx={(theme) => ({ bgcolor: theme.palette.custom.primaryButton, '&:hover': { bgcolor: theme.palette.custom.primaryButtonHover } })}
          >
            {actionLabel}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
