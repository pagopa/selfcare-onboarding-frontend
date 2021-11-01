import { Stack, Box, Typography } from '@mui/material';
import React from 'react';
import { RequestOutcomeMessage } from '../../types';

export function MessageNoAction({ img, title, description }: RequestOutcomeMessage) {
  return (
    <Stack spacing={10}>
      <Box style={{ textAlign: 'center' }}>
        <i>
          <img width={120} src={img.src} alt={img.alt} />
        </i>
        <Typography
          variant={'h2'}
          sx={{ color: 'text.primary', lineHeight: '49px', marginBottom: 1 }}
        >
          {title}
        </Typography>
        {/* 
        <p dangerouslySetInnerHTML={{ __html: title }}></p> */}
        {description.map((paragraph, i) => (
          <React.Fragment key={i}>{paragraph}</React.Fragment>
        ))}
      </Box>
    </Stack>
  );
}
