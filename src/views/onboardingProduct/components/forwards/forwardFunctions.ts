import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { InstitutionType } from '../../../../../types';
import { AdditionalGpuInformations } from '../../../../model/AdditionalGpuInformations';
import { AdditionalData, AdditionalInformations } from '../../../../model/AdditionalInformations';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { selected2OnboardingData } from '../../../../utils/selected2OnboardingData';

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
  desiredOriginRef: MutableRefObject<string | undefined>;
  activeStep: number;
  origin: string | undefined;
  setExternalInstitutionId: Dispatch<SetStateAction<string>>;
  externalInstitutionId: string;
  setAdditionalInformations: Dispatch<SetStateAction<AdditionalInformations | undefined>>;
  setAdditionalGPUInformations: Dispatch<SetStateAction<AdditionalGpuInformations | undefined>>;
  setPendingForward: Dispatch<SetStateAction<{ data: Partial<FormData> } | null>>;
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

    if (newInstitutionType === 'PRV' && productId === PRODUCT_IDS.PAGOPA) {
      selected2OnboardingData(null, undefined, newInstitutionType, productId);
      setOnboardingFormData(
        selected2OnboardingData(null, undefined, newInstitutionType, productId)
      );
      setActiveStep(4);
    } else {
      forward();
    }

    if (
      newInstitutionType !== 'GSP' &&
      newInstitutionType !== 'PA' &&
      newInstitutionType !== 'SA' &&
      newInstitutionType !== 'AS' &&
      newInstitutionType !== 'SCP' &&
      newInstitutionType !== 'PRV' &&
      newInstitutionType !== 'SCEC'
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
    if (newInstitutionType && newInstitutionType === 'PA') {
      setOrigin('IPA');
    } else {
      setOrigin(undefined);
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
      // eslint-disable-next-line functional/immutable-data
      desiredOriginRef.current = 'SELC';
      setOrigin('SELC');
      setActiveStep(activeStep + 3);
    } else {
      setInstitutionType(institutionTypeParam);
      setOnboardingFormData(onboardingData);
      setExternalInstitutionId(onboardingData?.externalId ?? '');
      const originToSet = onboardingData?.origin || origin;

      if (originToSet) {
        // eslint-disable-next-line functional/immutable-data
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

  return {
    forwardWithData,
    forwardWithInstitutionType,
    forwardWithDataAndInstitution,
    forwardWithBillingData,
    forwardWithAdditionalGSPInfo,
    forwardWithAdditionalGPUInfo,
    forwardWithOnboardingData,
  };
};
