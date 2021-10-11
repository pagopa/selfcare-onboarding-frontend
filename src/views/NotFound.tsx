import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { StyledIntro } from '../components/StyledIntro';
import { WhiteBackground } from '../components/WhiteBackground';

type NotFoundProps = {
  errorType?: 'not-found' | 'server-error';
};

export function NotFound({ errorType = 'not-found' }: NotFoundProps) {
  const DESCRIPTIONS = {
    'not-found': 'La pagina cercata purtroppo non esiste',
    'server-error': 'Si è verificato un errore temporaneo del server',
  };

  return (
    <React.Fragment>
      <Typography component="h1" variant="h2" align="center" color="text.primary" gutterBottom>
        Spiacenti
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" component="p">
        {DESCRIPTIONS[errorType]}
      </Typography>
    </React.Fragment>
  );
}
