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
  institutionDescription: string;
  productId: string;
  institutionType: string;
};

const loadQualtricsScript = (): Promise<void> =>
  new Promise((resolve) => {
    const container = document.createElement('div');
    container.id = ENV.QUALTRICS.SITE_ID;
    document.body.appendChild(container);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = ENV.QUALTRICS.SCRIPT_URL;
    script.addEventListener('load', () => resolve());
    document.body.appendChild(script);
  });

export const triggerQualtricsIntercept = async (data: QualtricsData): Promise<void> => {
  (window as any).institutionDescription = data.institutionDescription;
  (window as any).productId = data.productId;
  (window as any).institutionType = data.institutionType;

  if (!window.QSI?.API) {
    await loadQualtricsScript();
  }

  if (!window.QSI?.API) {
    return;
  }

  window.QSI.API.unload();
  window.QSI.API.load();
  window.QSI.API.run();
};
