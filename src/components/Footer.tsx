import React from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';

export function Footer() {
  return (
    <Box component="footer">
      <Typography variant="h6" align="center" gutterBottom>
        Footer
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
        Something here to give the footer a purpose!
      </Typography>
    </Box>
  );
}
