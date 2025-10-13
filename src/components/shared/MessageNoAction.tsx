import { Box, Typography, useTheme } from '@mui/material';
import React from 'react';
import { RequestOutcomeMessage } from '../../../types';

export function MessageNoAction({ img, title, description, ImgComponent }: RequestOutcomeMessage) {
  const theme = useTheme();
  return (
    <Box style={{ textAlign: 'center' }}>
      <Box mb={2}>
        <i>
          {ImgComponent ? (
            <ImgComponent />
          ) : img ? (
            <img width={60} src={img.src} alt={img.alt} />
          ) : null}
        </i>
      </Box>
      <Typography variant={'h4'} sx={{ color: theme.palette.text.primary, marginBottom: 1 }}>
        {title}
      </Typography>
      {/*
        <p dangerouslySetInnerHTML={{ __html: title }}></p> */}
      {description &&
        description.map((paragraph, i) => <React.Fragment key={i}>{paragraph}</React.Fragment>)}
    </Box>
  );
}
