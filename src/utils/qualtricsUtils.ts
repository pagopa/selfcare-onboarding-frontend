/* eslint-disable functional/immutable-data */
/* declare global {
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

import { ENV } from './env'; */

type QualtricsData = {
  institutionDescription?: string;
  productId: string;
  institutionType?: string;
};

export const redirectToQualtricsSurvey = (data: QualtricsData): void => {
  const surveyUrl = new URL('https://pagopa.qualtrics.com/jfe/form/SV_8pjZJ9AyxFrwBtI');
  surveyUrl.searchParams.set('institutionDescription', data.institutionDescription ?? '');
  surveyUrl.searchParams.set('productId', data.productId);
  surveyUrl.searchParams.set('institutionType', data.institutionType ?? '');
  window.open(surveyUrl.toString(), '_blank');
};

/* type QualtricsConfig = {
  scriptUrl: string;
  siteId: string;
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
}; */
