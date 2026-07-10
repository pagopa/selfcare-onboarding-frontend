/* eslint-disable functional/immutable-data */
declare global {
  interface Window {
    QSI?: {
      API: {
        unload: () => void;
        load: () => void;
        run: () => void;
      };
    };
  }
}

import { ENV } from './env';

type QualtricsData = {
  institutionDescription?: string;
  productId: string;
  institutionType?: string;
};

type QualtricsConfig = {
  scriptUrl: string;
  siteId: string;
};

// OneTrust cookie category the Qualtrics survey belongs to (Performance/Analytics),
// same group used to gate Mixpanel analytics in @pagopa/selfcare-common-frontend.
const QUALTRICS_COOKIE_GROUP = 'C0002';

/**
 * Returns true only if the user has granted consent for the given OneTrust cookie
 * group. Consent is read from the `OptanonConsent` cookie, where an accepted group
 * is encoded as `<group>:1` (URL-encoded as `<group>%3A1`).
 */
export const hasCookieConsent = (group: string = QUALTRICS_COOKIE_GROUP): boolean => {
  const optanonConsent =
    document.cookie.split('; ').find((row) => row.startsWith('OptanonConsent=')) ?? '';
  return optanonConsent.includes(`${group}%3A1`);
};

const loadQualtricsScript = (config: QualtricsConfig): Promise<void> =>
  new Promise((resolve) => {
    const container = document.createElement('div');
    container.id = config.siteId;
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = config.scriptUrl;
    script.addEventListener('load', () => resolve());
    document.body.appendChild(script);
  });

export const triggerQualtricsIntercept = async (
  data: QualtricsData,
  config: QualtricsConfig = { scriptUrl: ENV.QUALTRICS.SCRIPT_URL, siteId: ENV.QUALTRICS.SITE_ID }
): Promise<void> => {
  // The survey may only be shown if the user has accepted the related cookies.
  if (!hasCookieConsent()) {
    return;
  }

  (window as any).institutionDescription = data.institutionDescription ?? '';
  (window as any).productId = data.productId;
  (window as any).institutionType = data.institutionType ?? '';

  if (!window.QSI?.API) {
    await loadQualtricsScript(config);
  }

  if (!window.QSI?.API) {
    return;
  }

  window.QSI.API.unload();
  window.QSI.API.load();
  window.QSI.API.run();
};
