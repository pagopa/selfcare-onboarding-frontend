import { useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@mui/system';
import { Footer, Header } from '@pagopa/selfcare-common-frontend/lib';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { logAction } from '../../lib/action-log';
import { ENV } from '../../utils/env';
import { PRODUCT_IDS, ROUTES } from '../../utils/constants';
import { HeaderContext, UserContext } from './../../lib/context';
import { Main } from './Main';

export function BodyLogger() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const history = useHistory();
  const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
  const [onExit, setOnExit] = useState<((exitAction: () => void) => void) | undefined>();
  const [enableLogin, setEnableLogin] = useState<boolean>(true);
  const [showDocBtn, setShowDocBtn] = useState(false);

  useEffect(() => {
    if (location.pathname === '/onboarding/prod-io-premium') {
      history.push(
        ROUTES.ONBOARDING_PREMIUM.PATH.replace(':productId', PRODUCT_IDS.IO).replace(
          ':subProductId',
          PRODUCT_IDS.IO_PREMIUM
        )
      );
    }
  }, []);

  useEffect(() => {
    if (i18n.language === 'it') {
      setShowDocBtn(true);
    } else {
      setShowDocBtn(false);
    }
  }, [i18n.language]);

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
          onDocumentationClick={
            showDocBtn
              ? () => {
                  trackEvent('OPEN_OPERATIVE_MANUAL', {
                    from: 'onboarding',
                  });
                  window.open(ENV.URL_DOCUMENTATION, '_blank');
                }
              : undefined
          }
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
