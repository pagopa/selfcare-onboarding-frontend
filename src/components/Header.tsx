import React from 'react';
import { AppBar, Button, SvgIcon, Toolbar } from '@mui/material';
import { ReactComponent as logo } from '../assets/pagopa-logo.svg';

export function Header() {
  return (
    <AppBar position="relative">
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <SvgIcon component={logo} />
        <Button href="#">Esci</Button>
      </Toolbar>
    </AppBar>
  );
}
