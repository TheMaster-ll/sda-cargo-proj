import React from 'react';
import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../utils/constants';

export default function StatusBadge({ status, size = 'small' }) {
  const colors = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: size === 'small' ? 24 : 28
      }}
    />
  );
}
