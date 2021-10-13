import { Stack, Typography } from '@mui/material';
import React from 'react';
import { RequestOutcomeMessage } from '../../types';

export function MessageNoAction({ img, title, description }: RequestOutcomeMessage) {
  return (
    <Stack spacing={10}>
      <Typography style={{ textAlign: 'center' }}>
        <i>
          <img width={120} src={img.src} alt={img.alt} />
        </i>
        {title && <p dangerouslySetInnerHTML={{ __html: title }}></p>}
        {description.map((paragraph, i) => (
          <React.Fragment key={i}>{paragraph}</React.Fragment>
        ))}
      </Typography>
    </Stack>
  );
}
