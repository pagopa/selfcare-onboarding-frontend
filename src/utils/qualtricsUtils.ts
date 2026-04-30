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

type QualtricsData = {
  institutionDescription: string;
  productId: string;
  institutionType: string;
};

export const triggerQualtricsIntercept = (data: QualtricsData): void => {
  if (!window.QSI?.API) {
    return;
  }

  (window as any).institutionDescription = data.institutionDescription;
  (window as any).productId = data.productId;
  (window as any).institutionType = data.institutionType;

  window.QSI.API.unload();
  window.QSI.API.load();
  window.QSI.API.run();
};
