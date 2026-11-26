import { HeaderAccount, JwtUser } from '@pagopa/mui-italia';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { buildAssistanceURI } from '@pagopa/selfcare-common-frontend/lib/services/assistanceService';
import { withOnSuccess } from '@pagopa/selfcare-common-frontend/lib/utils/login-utils';

type Props = {
  loggedUser: JwtUser | false;
  onExit?: (exitAction: () => void) => void;
  enableLogin: boolean;
  enableAssistanceButton: boolean;
  assistanceEmail?: string;
  onDocumentationClick?: () => void;
};

const ROOT_LINK = {
  label: 'PagoPA S.p.A.',
  href: CONFIG.HEADER.LINK.ROOTLINK,
  ariaLabel: 'Link: vai al sito di PagoPA S.p.A.',
  title: 'Sito di PagoPA S.p.A.',
};

/**
 * Same header as the common-frontend one, but the assistance flow opens in a new tab
 * so the user does not leave the RTP onboarding (the common Header does not allow it).
 */
const RtpHeader = ({
  loggedUser,
  onExit = (exitAction) => exitAction(),
  enableLogin,
  enableAssistanceButton,
  assistanceEmail,
  onDocumentationClick,
}: Props) => (
  <header>
    <HeaderAccount
      rootLink={ROOT_LINK}
      loggedUser={loggedUser}
      onAssistanceClick={() =>
        window.open(buildAssistanceURI(assistanceEmail), '_blank', 'noopener,noreferrer')
      }
      onLogin={() => onExit(() => window.location.assign(withOnSuccess(CONFIG.URL_FE.LOGIN)))}
      onLogout={() => onExit(() => window.location.assign(CONFIG.URL_FE.LOGOUT))}
      enableLogin={enableLogin}
      enableAssistanceButton={enableAssistanceButton}
      onDocumentationClick={onDocumentationClick}
    />
  </header>
);

export default RtpHeader;
