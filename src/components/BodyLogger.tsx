import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/system';
import { logAction } from '../lib/action-log';
import Header from './header/Header';
import Footer from './Footer';
import { Main } from './Main';
import { HeaderContext } from './../lib/context';

export function BodyLogger() {
  const location = useLocation();
  const [subHeaderVisible , setSubHeaderVisible ] = useState<boolean>(false);
  const [onLogout, setOnLogout] = useState<(() => void) | null | undefined>();
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
    <HeaderContext.Provider value={{ subHeaderVisible , setSubHeaderVisible , onLogout, setOnLogout}}>
        <Header withSecondHeader={subHeaderVisible} onExitAction={onLogout} />
        <Main />
        <Footer />
    </ HeaderContext.Provider>
    </Box>
  );
}
