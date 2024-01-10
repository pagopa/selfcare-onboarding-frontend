import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/system';
import { Footer, Header } from '@pagopa/selfcare-common-frontend';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { logAction } from '../lib/action-log';
import { ENV } from '../utils/env';
import { Main } from './Main';
import { HeaderContext, UserContext } from './../lib/context';

export function BodyLogger() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
  const [onExit, setOnExit] = useState<((exitAction: () => void) => void) | undefined>();
  const [enableLogin, setEnableLogin] = useState<boolean>(true);

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
        justifyContent: 'space-between',
      }}
    >
      <HeaderContext.Provider
        value={{
          subHeaderVisible,
          setSubHeaderVisible,
          onExit,
          setOnExit,
          enableLogin,
          setEnableLogin,
        }}
      >
        <Header
          withSecondHeader={subHeaderVisible}
          onExit={onExit}
          enableAssistanceButton={ENV.ENV !== 'UAT'}
          assistanceEmail={ENV.ASSISTANCE.ENABLE ? ENV.ASSISTANCE.EMAIL : undefined}
          onDocumentationClick={() => {
            trackEvent('OPEN_OPERATIVE_MANUAL', {
              from: 'onboarding',
            });
            window.open(ENV.URL_DOCUMENTATION, '_blank');
          }}
          enableLogin={enableLogin}
          loggedUser={
            user
              ? {
                  id: user ? user.uid : '',
                  name: user?.name,
                  surname: user?.surname,
                  email: user?.email,
                }
              : false
          }
        />
        <Main />
        <Box>
          <Footer loggedUser={!!user} onExit={onExit} />
        </Box>
      </HeaderContext.Provider>
    </Box>
  );
}
