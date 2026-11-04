import { Dispatch, SetStateAction } from 'react';
import { InstitutionType, RequestOutcomeMessage } from '../../types';
import { OnboardingApi } from '../api/OnboardingApiClient';
import { AggregateResult } from '../api/generated/onboarding/AggregateResult';
import { RowErrorResponse } from '../api/generated/onboarding/RowErrorResponse';
import { AggregateInstitution } from '../model/AggregateInstitution';
import { RowError } from '../model/RowError';
import { genericError } from '../views/onboardingProduct/components/StepVerifyOnboarding';
import { ENV } from '../utils/env';

// The generated types are readonly: copy them into the mutable shapes used by the flow state
const toRowError = (error: RowErrorResponse): RowError => ({ ...error });

const toAggregateInstitution = (aggregate: AggregateResult): AggregateInstitution => ({
  ...aggregate,
  users: aggregate.users ? [...aggregate.users] : undefined,
});

export const verifyAggregates = async (
  file: File,
  setLoading: Dispatch<SetStateAction<boolean>>,
  institutionType: InstitutionType | undefined,
  productId: string | undefined,
  _setRequiredLogin: Dispatch<SetStateAction<boolean>>,
  parseJson2Csv: (errorJson: Array<RowError>) => void,
  setDisabled: Dispatch<SetStateAction<boolean>>,
  forward: (_: undefined, aggregates: Array<AggregateInstitution>) => void,
  setFoundErrors: Dispatch<SetStateAction<Array<RowError> | undefined>>,
  setOutcome: Dispatch<SetStateAction<RequestOutcomeMessage | null | undefined>>
) => {
  setLoading(true);

  try {
    const data = await OnboardingApi.verifyAggregatesCsv(file, productId ?? '', institutionType);
    const errors = (data.errors ?? []).map(toRowError);
    const aggregatesList = (data.aggregates ?? []).map(toAggregateInstitution);
    parseJson2Csv(errors);

    if (errors.length === 0) {
      setDisabled(false);
      forward(undefined, aggregatesList);
    } else {
      setDisabled(true);
      setFoundErrors(errors);
      setLoading(false);
    }
  } catch (_error) {
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
  } catch (error) {
    console.error((error as Error).message);
  }
};
