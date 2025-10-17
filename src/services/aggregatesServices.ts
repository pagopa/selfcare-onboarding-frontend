import { AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { InstitutionType, RequestOutcomeMessage } from '../../types';
import { fetchWithLogs } from '../lib/api-utils';
import { getFetchOutcome } from '../lib/error-utils';
import { AggregateInstitution } from '../model/AggregateInstitution';
import { RowError } from '../model/RowError';
import { genericError } from '../views/onboardingProduct/components/StepVerifyOnboarding';
import { ENV } from '../utils/env';

export const verifyAggregates = async (
  file: File,
  setLoading: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  parseJson2Csv: (errorJson: Array<RowError>) => void,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  forward: any,
  setFoundErrors: Dispatch<SetStateAction<Array<RowError> | undefined>>,
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>
) => {
  setLoading(true);

  const formData = new FormData();
  formData.append('aggregates', file);

  const verifyAggregates = await fetchWithLogs(
    {
      endpoint: 'ONBOARDING_VERIFY_AGGREGATES',
    },
    {
      method: 'POST',
      params: {
        institutionType,
        productId,
      },
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    },
    () => setRequiredLogin(true)
  );

  const result = getFetchOutcome(verifyAggregates);

  if (result === 'success') {
    const errors = (verifyAggregates as AxiosResponse).data.errors as Array<RowError>;
    const aggregatesList = (verifyAggregates as AxiosResponse).data
      .aggregates as Array<AggregateInstitution>;
    parseJson2Csv(errors);

    if (errors.length === 0) {
      setDisabled(false);
      forward(undefined, aggregatesList);
    } else {
      setDisabled(true);
      setFoundErrors(errors);
      setLoading(false);
    }
  } else {
    setOutcome(genericError);
    setLoading(false);
  }
};
export const getExampleAggregatesCsv = async (
  productId: string | undefined,
  productName: string | undefined,
  partyName: string | undefined
) => {
  try {
    const response = await fetch(
      `${ENV.BASE_PATH_CDN_URL}/resources/aggregates/${productId}_enti_aggregatori_template_esempio.csv`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'text/csv' },
      }
    );

    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
    }

    const csvText = await response.text();

    const blob = new Blob([csvText], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    // eslint-disable-next-line functional/immutable-data
    a.href = downloadUrl;
    // eslint-disable-next-line functional/immutable-data
    a.download = `${partyName}_${productName}_aggregati_esempio.csv`.replace(/ /g, '_');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error: any) {
    console.error(error.message);
  }
};
