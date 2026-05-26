/* eslint-disable functional/immutable-data */
import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  DataProtectionOfficerDto,
  InstitutionType,
  PaymentServiceProviderDto,
  Product,
  SelfcareParty,
  UserOnCreate,
} from '../../../../../types';
import { CompanyInformations } from '../../../../model/CompanyInformations';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { UsersObject } from '../../../../components/steps/StepAddManager';

interface SubProductForwardFunctionsParams {
  requestIdRef: MutableRefObject<string>;
  productId: string;
  subProductId: string;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  setProduct: Dispatch<SetStateAction<Product | undefined>>;
  setSubProduct: Dispatch<SetStateAction<Product | undefined>>;
  setParties: Dispatch<SetStateAction<Array<SelfcareParty>>>;
  setSelectedParty: Dispatch<SetStateAction<SelfcareParty | undefined>>;
  setBillingData: Dispatch<SetStateAction<OnboardingFormData | undefined>>;
  setInstitutionType: Dispatch<SetStateAction<InstitutionType | undefined>>;
  setPartyId: Dispatch<SetStateAction<string | undefined>>;
  setOrigin: Dispatch<SetStateAction<string>>;
  setOriginId: Dispatch<SetStateAction<string>>;
  setManager: Dispatch<SetStateAction<UserOnCreate | undefined>>;
  setUsers: Dispatch<SetStateAction<Array<UserOnCreate>>>;
  setCompanyInformations: Dispatch<SetStateAction<CompanyInformations | undefined>>;
  setIsCityEditable: Dispatch<SetStateAction<boolean>>;
  setPspData: Dispatch<SetStateAction<PaymentServiceProviderDto | undefined>>;
  setDpoData: Dispatch<SetStateAction<DataProtectionOfficerDto | undefined>>;
  setOpenConfirmationModal: Dispatch<SetStateAction<boolean>>;
  setStepAddManagerHistoryState: (value: UsersObject) => void;
  chooseFromMyParties: MutableRefObject<boolean>;
}

export const createSubProductForwardFunctions = (params: SubProductForwardFunctionsParams) => {
  const {
    requestIdRef,
    productId,
    subProductId,
    activeStep,
    setActiveStep,
    setProduct,
    setSubProduct,
    setParties,
    setSelectedParty,
    setBillingData,
    setInstitutionType,
    setPartyId,
    setOrigin,
    setOriginId,
    setManager,
    setUsers,
    setCompanyInformations,
    setIsCityEditable,
    setPspData,
    setDpoData,
    setOpenConfirmationModal,
    setStepAddManagerHistoryState,
    chooseFromMyParties,
  } = params;

  const forward = (i: number = 1) => {
    setActiveStep(activeStep + i);
  };

  const forwardWithInputs = (
    newProduct: Product,
    newSubProduct: Product,
    newParties: Array<SelfcareParty>
  ) => {
    setProduct(newProduct);
    setSubProduct(newSubProduct);
    setParties(newParties);
    setActiveStep(activeStep + 1);
  };

  const forwardWithBillingData = (newBillingData: OnboardingFormData) => {
    setBillingData(newBillingData);
    forward();
  };

  const forwardWithManagerData = (formData: any) => {
    setManager(formData.users[0]);
    setUsers(formData.users);
    setOpenConfirmationModal(true);
  };

  const forwardWithInstitution = (party: SelfcareParty, isUserParty: boolean) => {
    setSelectedParty(party);
    const event = isUserParty
      ? 'ONBOARDING_PREMIUM_ASSOCIATED_PARTY_SELECTION'
      : 'ONBOARDING_PREMIUM_PARTY_SELECTION';
    trackEvent(event, {
      party_id: party.id,
      request_id: requestIdRef.current,
      product_id: productId,
      subproduct_id: subProductId,
    });
    chooseFromMyParties.current = isUserParty;
    forward(isUserParty ? 3 : 2);
  };

  const forwardWithOnboardingData = (
    origin: string,
    originId: string,
    billingData?: OnboardingFormData,
    institutionType?: InstitutionType,
    partyId?: string,
    companyInformations?: CompanyInformations,
    country?: string,
    city?: string,
    county?: string,
    pspData?: PaymentServiceProviderDto,
    dpoData?: DataProtectionOfficerDto
  ) => {
    setStepAddManagerHistoryState({});

    if (billingData) {
      setBillingData({
        ...billingData,
        city,
        country,
        county,
      });
    }
    if (companyInformations) {
      setCompanyInformations(companyInformations);
    }

    if (!city) {
      setIsCityEditable(true);
    }

    if (city) {
      setIsCityEditable(false);
    }

    if (pspData) {
      setPspData(pspData);
    }

    if (dpoData) {
      setDpoData(dpoData);
    }

    setOrigin(origin);
    setOriginId(originId);
    setInstitutionType(institutionType);
    setPartyId(partyId);
    forward();
  };

  return {
    forward,
    forwardWithInputs,
    forwardWithBillingData,
    forwardWithManagerData,
    forwardWithInstitution,
    forwardWithOnboardingData,
  };
};
