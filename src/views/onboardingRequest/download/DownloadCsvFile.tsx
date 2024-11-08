import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productId2ProductTitle } from '@pagopa/selfcare-common-frontend/lib/utils/productId2ProductTitle';
import { HeaderContext, UserContext } from '../../../lib/context';
import { ENV } from '../../../utils/env';

const DownloadCsvFile: React.FC = () => {
  const { onboardingId, productId } = useParams<{ onboardingId: string; productId: string }>();
  const { setSubHeaderVisible, setOnExit, setEnableLogin } = useContext(HeaderContext);
  const { setRequiredLogin } = useContext(UserContext);

  useEffect(() => {
    setSubHeaderVisible(true);
    setEnableLogin(false);
    return () => {
      setSubHeaderVisible(true);
      setOnExit(undefined);
      setEnableLogin(true);
    };
  }, []);

  useEffect(() => {
    if (onboardingId && productId) {
      const sessionToken = storageTokenOps.read();

      if (!sessionToken) {
        setRequiredLogin(true);
        window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 1000);
        return;
      }
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
            if (response.status === 401) {
              window.setTimeout(() => window.location.assign(ENV.URL_FE.LOGOUT), 1000);
            }
            return Promise.reject('Failed to download the file');
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
          const link = document.createElement('a');
          // eslint-disable-next-line functional/immutable-data
          link.href = url;
          link.setAttribute('download', `${productId2ProductTitle(productId)}_aggregati.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [onboardingId, productId]);

  return <div style={{ minHeight: '30vh' }}></div>;
};

export default DownloadCsvFile;
