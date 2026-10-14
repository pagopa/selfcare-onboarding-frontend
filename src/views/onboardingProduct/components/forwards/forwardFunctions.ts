/* eslint-disable functional/immutable-data */
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Dispatch, MutableRefObject } from 'react';
import { InstitutionType } from '../../../../../types';
import { AdditionalGpuInformations } from '../../../../model/AdditionalGpuInformations';
import { AdditionalData, AdditionalInformations } from '../../../../model/AdditionalInformations';
import { AggregateInstitution } from '../../../../model/AggregateInstitution';
import { OnboardingFormData, UserRequester } from '../../../../model/OnboardingFormData';
import {
  OnboardingProductAction,
  OnboardingProductState,
  usersOf,
} from '../../state/onboardingProductReducer';
import {
  afterAdmins,
  afterAggregates,
  isGspWithoutIpa,
  requiresApplicantEmail,
} from '../../state/onboardingTransitions';

export type ForwardFunctionsContext = {
  productId: string;
  loggedUserTaxCode?: string;
  /** Mirrors ENV.GSP.NO_IPA. */
  gspNoIpaEnabled: boolean;
};

export type ForwardFunctionsEffects = {
  requestIdRef: MutableRefObject<string | undefined>;
  desiredOriginRef: MutableRefObject<string | Array<string> | undefined>;
  onSubmit: (
    userData?: Partial<FormData>,
    aggregates?: Array<AggregateInstitution>,
    updatedOnboardingFormData?: OnboardingFormData
  ) => void;
};

export type ForwardFunctionsParams = {
  state: OnboardingProductState;
  dispatch: Dispatch<OnboardingProductAction>;
  ctx: ForwardFunctionsContext;
  effects: ForwardFunctionsEffects;
};

export const toAdditionalInformations = (newAdditionalInformations: {
  [key: string]: AdditionalData;
}): AdditionalInformations => ({
  agentOfPublicService: newAdditionalInformations.isConcessionaireOfPublicService?.choice,
  agentOfPublicServiceNote:
    newAdditionalInformations.isConcessionaireOfPublicService?.textFieldValue,
  belongRegulatedMarket: newAdditionalInformations.fromBelongsRegulatedMarket?.choice,
  regulatedMarketNote: newAdditionalInformations.fromBelongsRegulatedMarket?.textFieldValue,
  establishedByRegulatoryProvision:
    newAdditionalInformations.isEstabilishedRegulatoryProvision?.choice,
  establishedByRegulatoryProvisionNote:
    newAdditionalInformations.isEstabilishedRegulatoryProvision?.textFieldValue,
  ipa: newAdditionalInformations.isFromIPA?.choice,
  ipaCode: newAdditionalInformations.isFromIPA?.textFieldValue,
  otherNote: newAdditionalInformations.optionalPartyInformations?.textFieldValue ?? '',
});

export const toAdditionalGpuInformations = (
  newAdditionalGpuInformations: AdditionalGpuInformations
): AdditionalGpuInformations => ({
  businessRegisterNumber: newAdditionalGpuInformations?.businessRegisterNumber,
  legalRegisterNumber: newAdditionalGpuInformations?.legalRegisterNumber,
  legalRegisterName: newAdditionalGpuInformations.legalRegisterName,
  longTermPayments: newAdditionalGpuInformations.longTermPayments,
  manager: newAdditionalGpuInformations.manager,
  managerAuthorized: newAdditionalGpuInformations.managerAuthorized,
  managerEligible: newAdditionalGpuInformations.managerEligible,
  managerProsecution: newAdditionalGpuInformations.managerProsecution,
  institutionCourtMeasures: newAdditionalGpuInformations.institutionCourtMeasures,
});

/**
 * Handlers of the forward actions of each step: they track the analytics events, dispatch the
 * reducer action that records the data and moves to the next step, and submit the onboarding
 * when the transition says so.
 */
export const createForwardFunctions = ({
  state,
  dispatch,
  ctx,
  effects,
}: ForwardFunctionsParams) => {
  const { formData, onboardingFormData, externalInstitutionId, origin, aggregatesData } = state;
  const { productId, loggedUserTaxCode, gspNoIpaEnabled } = ctx;
  const { requestIdRef, desiredOriginRef, onSubmit } = effects;

  const forwardWithData = (newFormData: Partial<FormData>) => {
    dispatch({ type: 'USERS_SUBMITTED', from: 'manager', formData: newFormData });
  };

  const forwardWithInstitutionType = (newInstitutionType: InstitutionType) => {
    const partyExternalIdByQuery = new URLSearchParams(window.location.search).get(
      'partyExternalId'
    );
    trackEvent('ONBOARDING_PARTY_TYPE_SELECTION', {
      request_id: requestIdRef.current,
      party_id: partyExternalIdByQuery ?? '',
      product_id: productId,
    });
    dispatch({ type: 'INSTITUTION_TYPE_SELECTED', institutionType: newInstitutionType, productId });
  };

  const forwardGspNoIpa = () => {
    desiredOriginRef.current = 'SELC';
    dispatch({ type: 'GSP_NO_IPA_SELECTED', from: state.activeStep });
  };

  const forwardWithDataAndInstitution = (
    onboardingData: OnboardingFormData,
    institutionTypeParam: InstitutionType
  ) => {
    if (isGspWithoutIpa(onboardingData, institutionTypeParam)) {
      if (!gspNoIpaEnabled) {
        desiredOriginRef.current = 'SELC';
      }
    } else {
      const originToSet =
        institutionTypeParam === 'GSP' && onboardingData?.originId
          ? 'IPA'
          : onboardingData?.origin || origin;
      if (originToSet) {
        desiredOriginRef.current = originToSet;
      }
      trackEvent('ONBOARDING_PARTY_SELECTION', {
        party_id: onboardingData?.externalId,
        request_id: requestIdRef.current,
        product_id: productId,
      });
    }
    dispatch({
      type: 'PARTY_SELECTED',
      party: onboardingData,
      institutionType: institutionTypeParam,
      gspNoIpaEnabled,
    });
  };

  const forwardFromVerifyOnboarding = () => {
    dispatch({ type: 'GO_TO_STEP', step: 'onboardingData' });
  };

  const forwardWithBillingData = (newOnboardingFormData: OnboardingFormData) => {
    trackEvent('ONBOARDING_BILLING_DATA', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      geographic_taxonomies: newOnboardingFormData.geographicTaxonomies,
    });
    dispatch({ type: 'BILLING_DATA_SUBMITTED', onboardingFormData: newOnboardingFormData });
  };

  const forwardWithAdditionalGSPInfo = (newAdditionalInformations: {
    [key: string]: AdditionalData;
  }) => {
    dispatch({
      type: 'ADDITIONAL_INFO_SUBMITTED',
      additionalInformations: toAdditionalInformations(newAdditionalInformations),
    });
  };

  const forwardWithAdditionalGPUInfo = (
    newAdditionalGpuInformations: AdditionalGpuInformations
  ) => {
    dispatch({
      type: 'ADDITIONAL_GPU_INFO_SUBMITTED',
      additionalGPUInformations: toAdditionalGpuInformations(newAdditionalGpuInformations),
    });
  };

  const forwardWithOnboardingData = (
    onboardingFormDataParam?: OnboardingFormData,
    institutionTypeParam?: InstitutionType,
    _id?: string
  ) => {
    dispatch({
      type: 'ONBOARDING_DATA_LOADED',
      onboardingFormData: onboardingFormDataParam,
      institutionType: institutionTypeParam,
    });
  };

  const forwardFromManager = (newFormData: Partial<FormData>) => {
    trackEvent('ONBOARDING_ADD_MANAGER', {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
    });
    forwardWithData(newFormData);
  };

  const forwardFromAdmin = (newFormData: Partial<FormData> | undefined) => {
    const userData = { ...formData, ...newFormData };
    dispatch({ type: 'USERS_SUBMITTED', from: 'admins', formData: newFormData, loggedUserTaxCode });
    const transition = afterAdmins({
      isAggregator: !!onboardingFormData?.isAggregator,
      isApplicantEmailRequired: requiresApplicantEmail(usersOf(userData), loggedUserTaxCode),
    });
    if (transition.kind === 'submit') {
      onSubmit(userData);
    }
  };

  const forwardFromAggregator = (_: any, aggregates?: Array<AggregateInstitution>) => {
    const transition = afterAggregates({
      isApplicantEmailRequired: requiresApplicantEmail(usersOf(formData), loggedUserTaxCode),
    });
    if (transition.kind === 'submit') {
      onSubmit(undefined, aggregates);
    } else {
      // verifyAggregates leaves the loading on: the reducer releases it since no submit happens
      dispatch({ type: 'AGGREGATES_SUBMITTED', aggregates, loggedUserTaxCode });
    }
  };

  const forwardFromApplicantEmail = (userRequester: UserRequester) => {
    const updatedOnboardingFormData = {
      ...onboardingFormData,
      userRequester,
    } as OnboardingFormData;
    dispatch({ type: 'APPLICANT_EMAIL_SUBMITTED', userRequester });
    onSubmit(undefined, aggregatesData, updatedOnboardingFormData);
  };

  return {
    forwardWithData,
    forwardWithInstitutionType,
    forwardGspNoIpa,
    forwardWithDataAndInstitution,
    forwardFromVerifyOnboarding,
    forwardWithBillingData,
    forwardWithAdditionalGSPInfo,
    forwardWithAdditionalGPUInfo,
    forwardWithOnboardingData,
    forwardFromManager,
    forwardFromAggregator,
    forwardFromAdmin,
    forwardFromApplicantEmail,
  };
};
