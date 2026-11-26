import { Box } from '@mui/system';
import { Footer, Header } from '@pagopa/selfcare-common-frontend/lib';
import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { useContext, useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { logAction } from '../../lib/action-log';
import { PRODUCT_IDS, ROUTES } from '../../utils/constants';
import { ENV } from '../../utils/env';
import { HeaderContext, UserContext } from './../../lib/context';
import { Main } from './Main';
import RtpHeader from './RtpHeader';

export function BodyLogger() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
  const [onExit, setOnExit] = useState<((exitAction: () => void) => void) | undefined>();
  const [enableLogin, setEnableLogin] = useState<boolean>(true);
  const [showDocBtn, setShowDocBtn] = useState(false);

  useEffect(() => {
    if (location.pathname === '/onboarding/prod-io-premium') {
      void navigate(
        ROUTES.ONBOARDING_PREMIUM.PATH.replace(':productId', PRODUCT_IDS.IO).replace(
          ':subProductId',
          PRODUCT_IDS.IO_PREMIUM
        )
      );
    } else if (location.pathname === '/onboarding/prod-dashboard-psp') {
      void navigate(
        ROUTES.ONBOARDING_PREMIUM.PATH.replace(':productId', PRODUCT_IDS.PAGOPA).replace(
          ':subProductId',
          PRODUCT_IDS.DASHBOARD_PSP
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

  const isRtpRoute =
    matchPath({ path: ROUTES.ONBOARDING_PRODUCT.PATH, end: false }, location.pathname)?.params
      .productId === PRODUCT_IDS.RTP;

  const headerProps = {
    onExit,
    enableAssistanceButton: ENV.ENV !== 'UAT',
    assistanceEmail: ENV.ASSISTANCE.ENABLE ? ENV.ASSISTANCE.EMAIL : undefined,
    onDocumentationClick: showDocBtn
      ? () => {
          trackEvent('OPEN_OPERATIVE_MANUAL', {
            from: 'onboarding',
          });
          window.open(ENV.URL_DOCUMENTATION, '_blank');
        }
      : undefined,
    enableLogin,
    loggedUser: user
      ? {
          id: user.uid,
          name: user.name,
          surname: user.surname,
          email: user.email,
        }
      : (false as const),
  };

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
        {isRtpRoute ? (
          <RtpHeader {...headerProps} />
        ) : (
          <Header withSecondHeader={subHeaderVisible} {...headerProps} />
        )}
        <Main />
        <Box>
          <Footer loggedUser={!!user} onExit={onExit} />
        </Box>
      </HeaderContext.Provider>
    </Box>
  );
}
