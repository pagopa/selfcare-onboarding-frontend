import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ENV } from '../../../utils/env';

const DownloadCsvFile: React.FC = () => {
  const { onboardingId, productId } = useParams<{ onboardingId: string; productId: string }>();

  useEffect(() => {
    if (onboardingId && productId) {
      const sessionToken = storageTokenOps.read();
      fetch(
        `${ENV.URL_API.ONBOARDING_V2}/v2/tokens/${onboardingId}/products/${productId}/aggregates-csv`,
        {
          headers: {
            accept: '*/*',
            'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/octet-stream',
            authorization: `Bearer ${sessionToken}`,
          },
          method: 'GET',
        }
      )
        .then((response) => {
          if (!response.ok) {
            return Promise.reject('Failed to download the file');
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
          const link = document.createElement('a');
          // eslint-disable-next-line functional/immutable-data
          link.href = url;
          link.setAttribute('download', `${productId}_aggregati.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [onboardingId, productId]);

  return <></>;
};

export default DownloadCsvFile;
