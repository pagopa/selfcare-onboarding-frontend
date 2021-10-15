import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/system';
import { logAction } from '../lib/action-log';
import { Header } from './Header';
import { Footer } from './Footer';
import { Main } from './Main';

export function BodyLogger() {
  const location = useLocation();

  /*
   * Handle data logging (now console.log, in the future might be Analytics)
   */
  useEffect(() => {
    logAction('Route change', location);
  }, [location]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Main />
      <Footer />
    </Box>
  );
}
