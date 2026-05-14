import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({ title, value, icon: Icon, subtitle, color = '#1a3a4a', trend }) {
  return (
    <Card sx={{ flex: 1, minWidth: 180 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            {(subtitle || trend) && (
              <Typography variant="caption" sx={{ color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#64748b', mt: 0.5, display: 'block' }}>
                {trend > 0 ? `+${trend}` : trend}{trend ? '' : ''} {subtitle}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box sx={{ p: 1, bgcolor: `${color}15`, borderRadius: 2, display: 'flex' }}>
              <Icon size={22} color={color} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
