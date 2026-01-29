/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { InstitutionType, UserOnCreate } from '../../../../../types';
import { AdditionalGpuInformations } from '../../../../model/AdditionalGpuInformations';
import { AdditionalData, AdditionalInformations } from '../../../../model/AdditionalInformations';
import { OnboardingFormData, UserRequester } from '../../../../model/OnboardingFormData';
import { AggregateInstitution } from '../../../../model/AggregateInstitution';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { selected2OnboardingData } from '../../../../utils/selected2OnboardingData';
import {
  isConsolidatedEconomicAccountCompany,
  isContractingAuthority,
  isGlobalServiceProvider,
  isInsuranceCompany,
  isPagoPaProduct,
  isPrivateInstitution,
  isPublicAdministration,
  isPublicServiceCompany,
} from '../../../../utils/institutionTypeUtils';

interface ForwardFunctionsParams {
  requestIdRef: MutableRefObject<string | undefined>;
  productId: string;
  institutionType: InstitutionType | undefined;
  onboardingFormData: OnboardingFormData | undefined;
  setInstitutionType: Dispatch<SetStateAction<InstitutionType | undefined>>;
  setOnboardingFormData: Dispatch<SetStateAction<OnboardingFormData | undefined>>;
  setActiveStep: Dispatch<SetStateAction<number>>;
  setOrigin: Dispatch<SetStateAction<string | undefined>>;
  forward: () => void;
  formData: Partial<FormData> | undefined;
  setFormData: Dispatch<SetStateAction<Partial<FormData> | undefined>>;
  desiredOriginRef: MutableRefObject<string | Array<string> | undefined>;
  activeStep: number;
  origin: string | undefined;
  setExternalInstitutionId: Dispatch<SetStateAction<string>>;
  externalInstitutionId: string;
  setAdditionalInformations: Dispatch<SetStateAction<AdditionalInformations | undefined>>;
  setAdditionalGPUInformations: Dispatch<SetStateAction<AdditionalGpuInformations | undefined>>;
  setPendingForward: Dispatch<SetStateAction<{ data: Partial<FormData> } | null>>;
  user: User | null;
  onSubmit: (userData?: Partial<FormData>, aggregates?: Array<AggregateInstitution>, updatedOnboardingFormData?: OnboardingFormData) => void;
  aggregatesData: Array<AggregateInstitution> | undefined;
  setAggregatesData: Dispatch<SetStateAction<Array<AggregateInstitution> | undefined>>;
}

export const createForwardFunctions = (params: ForwardFunctionsParams) => {
  const {
    requestIdRef,
    productId,
    institutionType,
    onboardingFormData,
    setInstitutionType,
    setOnboardingFormData,
    setActiveStep,
    setOrigin,
    forward,
    formData,
    setFormData,
    desiredOriginRef,
    activeStep,
    origin,
    setExternalInstitutionId,
    externalInstitutionId,
    setAdditionalInformations,
    setAdditionalGPUInformations,
    setPendingForward,
    user,
    onSubmit,
    aggregatesData,
    setAggregatesData,
  } = params;

  const forwardWithData = (newFormData: Partial<FormData>) => {
    if (formData) {
      setFormData({ ...formData, ...newFormData });
    } else {
      setFormData(newFormData);
    }
    forward();
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
    setInstitutionType(newInstitutionType);

    if (isPrivateInstitution(newInstitutionType as InstitutionType) && isPagoPaProduct(productId)) {
      selected2OnboardingData(null, undefined, newInstitutionType, productId);
      setOnboardingFormData(
        selected2OnboardingData(null, undefined, newInstitutionType, productId)
      );
      setActiveStep(4);
    } else {
      forward();
    }

    if (
      !isGlobalServiceProvider(newInstitutionType) &&
      !isPublicAdministration(newInstitutionType) &&
      !isContractingAuthority(newInstitutionType) &&
      !isInsuranceCompany(newInstitutionType as InstitutionType) &&
      !isPublicServiceCompany(newInstitutionType) &&
      !isPrivateInstitution(newInstitutionType) &&
      !isConsolidatedEconomicAccountCompany(newInstitutionType)
    ) {
      if (newInstitutionType !== institutionType) {
        setOnboardingFormData({
          businessName: '',
          registeredOffice: '',
          zipCode: '',
          digitalAddress: '',
          taxCode: '',
          vatNumber: '',
          recipientCode: '',
          geographicTaxonomies: [],
        });
      } else {
        setOnboardingFormData(onboardingFormData);
      }
      setActiveStep(4);
    }
  };

  const forwardWithDataAndInstitution = (
    onboardingData: OnboardingFormData,
    institutionTypeParam: InstitutionType
  ) => {
    if (
      onboardingData?.taxCode === '' &&
      onboardingData?.originId === undefined &&
      institutionTypeParam === 'GSP'
    ) {
      desiredOriginRef.current = 'SELC';
      setOrigin('SELC');
      setOnboardingFormData({
        businessName: '',
        registeredOffice: '',
        zipCode: '',
        digitalAddress: '',
        taxCode: '',
        vatNumber: '',
        recipientCode: '',
        geographicTaxonomies: [],
      });
      setExternalInstitutionId('');
      setActiveStep(activeStep + 3);
    } else {
      setInstitutionType(institutionTypeParam);
      setOnboardingFormData(onboardingData);
      setExternalInstitutionId(onboardingData?.externalId ?? '');

      const originToSet =
        institutionTypeParam === 'GSP' && onboardingData?.originId
          ? 'IPA'
          : onboardingData?.origin || origin;

      if (originToSet) {
        desiredOriginRef.current = originToSet;
      }

      setOrigin(originToSet);
      trackEvent('ONBOARDING_PARTY_SELECTION', {
        party_id: onboardingData?.externalId,
        request_id: requestIdRef.current,
        product_id: productId,
      });

      setPendingForward({
        data: onboardingData as Partial<FormData>,
      });
    }
  };

  const forwardWithBillingData = (newOnboardingFormData: OnboardingFormData) => {
    const trackingData = {
      request_id: requestIdRef.current,
      party_id: externalInstitutionId,
      product_id: productId,
      geographic_taxonomies: newOnboardingFormData.geographicTaxonomies,
    };
    trackEvent('ONBOARDING_BILLING_DATA', trackingData);
    setOnboardingFormData(newOnboardingFormData);
    switch (institutionType) {
      case 'GSP':
        if (productId === PRODUCT_IDS.PAGOPA) {
          setActiveStep(activeStep + 2);
        } else {
          setActiveStep(activeStep + 3);
        }
        break;
      case 'GPU':
        setActiveStep(activeStep + 1);
        break;
      case 'PT':
        setActiveStep(activeStep + 4);
        break;
      default:
        setActiveStep(activeStep + 3);
        break;
    }
  };

  const forwardWithAdditionalGSPInfo = (newAdditionalInformations: {
    [key: string]: AdditionalData;
  }) => {
    setAdditionalInformations({
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
    forward();
  };

  const forwardWithAdditionalGPUInfo = (
    newAdditionalGpuInformations: AdditionalGpuInformations
  ) => {
    setAdditionalGPUInformations({
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
    setActiveStep(activeStep + 2);
  };

  const forwardWithOnboardingData = (
    onboardingFormDataParam?: OnboardingFormData,
    institutionTypeParam?: InstitutionType,
    _id?: string
  ) => {
    if (onboardingFormDataParam) {
      setOnboardingFormData(onboardingFormDataParam);
    }
    setInstitutionType(institutionTypeParam);
    forward();
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
    setFormData(userData);
    if (onboardingFormData?.isAggregator) {
      forward();
    } else if ((userData as any)?.users?.every((u: UserOnCreate) => u?.taxCode !== user?.taxCode)) {
      setActiveStep(activeStep + 2);
    } else {
      onSubmit(userData);
    }
  };

  const forwardFromAggregator = (_: any, aggregates?: Array<AggregateInstitution>) => {
    if ((formData as any)?.users?.every((u: UserOnCreate) => u.taxCode !== user?.taxCode)) {
      setAggregatesData(aggregates);
      forward();
    } else {
      onSubmit(undefined, aggregates);
    }
  };

  const forwardFromApplicantEmail = (userRequester: UserRequester) => {
    const updatedOnboardingFormData = {
      ...onboardingFormData,
      userRequester,
    } as OnboardingFormData;
    setOnboardingFormData(updatedOnboardingFormData);
    onSubmit(undefined, aggregatesData, updatedOnboardingFormData);
  };

  return {
    forwardWithData,
    forwardWithInstitutionType,
    forwardWithDataAndInstitution,
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
