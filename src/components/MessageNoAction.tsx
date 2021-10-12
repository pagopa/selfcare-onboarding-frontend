import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { RequestOutcomeMessage } from '../../types';

export function MessageNoAction({ img, title, description }: RequestOutcomeMessage) {
  return (
    <Box>
      <Typography style={{ maxWidth: 440 }}>
        <i>
          <img width={120} src={img.src} alt={img.alt} />
        </i>
        {title && (
          <p dangerouslySetInnerHTML={{ __html: title }}></p>
        )}
        {description.map((paragraph, i) => (
          <React.Fragment key={i}>{paragraph}</React.Fragment>
        ))}
      </Typography>
    </Box>
  );
}
