import { Stack, Box, Typography } from '@mui/material';
import React from 'react';
import { RequestOutcomeMessage } from '../../types';

export function MessageNoAction({ img, title, description, ImgComponent }: RequestOutcomeMessage) {
  return (
    <Stack spacing={10}>
      <Box style={{ textAlign: 'center' }}>
        <Box mb={3}>
          <i>
            {ImgComponent ? (
              <ImgComponent />
            ) : img ? (
              <img width={120} src={img.src} alt={img.alt} />
            ) : null}
          </i>
        </Box>
        <Typography
          variant={'h2'}
          sx={{ color: 'text.primary', lineHeight: '49px', marginBottom: 1 }}
        >
          {title}
        </Typography>
        {/*
        <p dangerouslySetInnerHTML={{ __html: title }}></p> */}
        {description &&
          description.map((paragraph, i) => <React.Fragment key={i}>{paragraph}</React.Fragment>)}
      </Box>
    </Stack>
  );
}
