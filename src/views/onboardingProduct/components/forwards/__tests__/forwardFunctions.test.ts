import { trackEvent } from '@pagopa/selfcare-common-frontend/lib/services/analyticsService';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { InstitutionType } from '../../../../../../types';
import { AdditionalGpuInformations } from '../../../../../model/AdditionalGpuInformations';
import { AggregateInstitution } from '../../../../../model/AggregateInstitution';
import { OnboardingFormData, UserRequester } from '../../../../../model/OnboardingFormData';
import {
  createInitialState,
  onboardingProductReducer,
  OnboardingProductAction,
  OnboardingProductState,
} from '../../../state/onboardingProductReducer';
import { createForwardFunctions } from '../forwardFunctions';

vi.mock('@pagopa/selfcare-common-frontend/lib/services/analyticsService', () => ({
  trackEvent: vi.fn(),
}));

const PRODUCT_ID = 'prod-io';
const LOGGED_TAX_CODE = 'LGGUSR80A01H501U';
const REQUEST_ID = 'onboarding-request-1';

const loggedUser = { taxCode: LOGGED_TAX_CODE, name: 'Logged', surname: 'User' };
const otherUser = { taxCode: 'OTHUSR80A01H501U', name: 'Other', surname: 'User' };

const build = (
  stateOverrides: Partial<OnboardingProductState> = {},
  ctxOverrides: { gspNoIpaEnabled?: boolean; loggedUserTaxCode?: string } = {}
) => {
  const dispatch = vi.fn();
  const onSubmit = vi.fn();
  const state = createInitialState({
    externalInstitutionId: 'ext-id',
    ...stateOverrides,
  });
  const functions = createForwardFunctions({
    state,
    dispatch,
    ctx: {
      productId: PRODUCT_ID,
      loggedUserTaxCode: LOGGED_TAX_CODE,
      gspNoIpaEnabled: false,
      ...ctxOverrides,
    },
    effects: { requestIdRef: { current: REQUEST_ID }, onSubmit },
  });
  /** Replays the dispatched actions on the real reducer. */
  const reduce = (): OnboardingProductState =>
    dispatch.mock.calls.reduce<OnboardingProductState>(
      (acc, [action]) => onboardingProductReducer(acc, action as OnboardingProductAction),
      state
    );
  return { ...functions, dispatch, onSubmit, state, reduce };
};

beforeEach(() => {
  vi.mocked(trackEvent).mockClear();
});

describe('forwardWithInstitutionType', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  test('tracks the selection with an empty party id and selects the institution type', () => {
    const { forwardWithInstitutionType, dispatch } = build();

    forwardWithInstitutionType('PA');

    expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_PARTY_TYPE_SELECTION', {
      request_id: REQUEST_ID,
      party_id: '',
      product_id: PRODUCT_ID,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'INSTITUTION_TYPE_SELECTED',
      institutionType: 'PA',
      productId: PRODUCT_ID,
    });
  });

  test('tracks the partyExternalId from the query string', () => {
    window.history.replaceState({}, '', '/?partyExternalId=party-from-url');
    const { forwardWithInstitutionType } = build();

    forwardWithInstitutionType('GSP');

    expect(trackEvent).toHaveBeenCalledWith(
      'ONBOARDING_PARTY_TYPE_SELECTION',
      expect.objectContaining({ party_id: 'party-from-url' })
    );
  });

  test.each([
    ['PA', 'searchParty'],
    ['GSP', 'searchParty'],
    ['PSP', 'billingData'],
    ['PT', 'billingData'],
  ] as Array<[InstitutionType, string]>)('%s lands on %s', (institutionType, step) => {
    const { forwardWithInstitutionType, reduce } = build();

    forwardWithInstitutionType(institutionType);

    expect(reduce().activeStep).toBe(step);
  });
});

describe('party selection', () => {
  const party = {
    externalId: 'party-ext-id',
    taxCode: '00000000000',
    originId: 'c_h501',
    origin: 'IPA',
    businessName: 'Comune di Roma',
  } as OnboardingFormData;
  const gspNoIpaParty = { taxCode: '', businessName: 'AGENCY X' } as OnboardingFormData;

  test('forwardWithDataAndInstitution tracks the party and dispatches PARTY_SELECTED', () => {
    const { forwardWithDataAndInstitution, dispatch, reduce } = build({
      activeStep: 'searchParty',
    });

    forwardWithDataAndInstitution(party, 'PA');

    expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_PARTY_SELECTION', {
      party_id: 'party-ext-id',
      request_id: REQUEST_ID,
      product_id: PRODUCT_ID,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'PARTY_SELECTED',
      party,
      institutionType: 'PA',
      gspNoIpaEnabled: false,
    });
    expect(reduce()).toMatchObject({
      activeStep: 'verifyOnboarding',
      externalInstitutionId: 'party-ext-id',
      origin: 'IPA',
    });
  });

  test.each([
    [true, 'contractsSummary'],
    [false, 'onboardingData'],
  ])('a GSP without IPA is not tracked (NO_IPA=%s) and lands on %s', (gspNoIpaEnabled, step) => {
    const { forwardWithDataAndInstitution, dispatch, reduce } = build(
      { activeStep: 'searchParty' },
      { gspNoIpaEnabled }
    );

    forwardWithDataAndInstitution(gspNoIpaParty, 'GSP');

    expect(trackEvent).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ gspNoIpaEnabled }));
    expect(reduce().activeStep).toBe(step);
  });

  test('forwardGspNoIpa from the contracts summary goes to the billing data as SELC', () => {
    const { forwardGspNoIpa, dispatch, reduce } = build({ activeStep: 'contractsSummary' });

    forwardGspNoIpa();

    expect(dispatch).toHaveBeenCalledWith({
      type: 'GSP_NO_IPA_SELECTED',
      from: 'contractsSummary',
    });
    expect(reduce()).toMatchObject({ activeStep: 'billingData', origin: 'SELC' });
  });

  test('forwardFromVerifyOnboarding goes to the onboarding data', () => {
    const { forwardFromVerifyOnboarding, dispatch } = build({ activeStep: 'verifyOnboarding' });

    forwardFromVerifyOnboarding();

    expect(dispatch).toHaveBeenCalledWith({ type: 'GO_TO_STEP', step: 'onboardingData' });
  });

  test('forwardWithOnboardingData records the data and the institution type', () => {
    const { forwardWithOnboardingData, dispatch } = build({ activeStep: 'onboardingData' });

    forwardWithOnboardingData(party, 'PA', 'ignored-id');

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ONBOARDING_DATA_LOADED',
      onboardingFormData: party,
      institutionType: 'PA',
    });
  });
});

describe('data steps', () => {
  const billingData = {
    businessName: 'Comune di Roma',
    geographicTaxonomies: [{ code: '058091', desc: 'ROMA - COMUNE' }],
  } as unknown as OnboardingFormData;

  test('forwardWithBillingData tracks the billing data and submits them', () => {
    const { forwardWithBillingData, dispatch } = build({ institutionType: 'PA' });

    forwardWithBillingData(billingData);

    expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_BILLING_DATA', {
      request_id: REQUEST_ID,
      party_id: 'ext-id',
      product_id: PRODUCT_ID,
      geographic_taxonomies: billingData.geographicTaxonomies,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'BILLING_DATA_SUBMITTED',
      onboardingFormData: billingData,
    });
  });

  test('forwardWithAdditionalGSPInfo maps the form answers to the additional informations', () => {
    const { forwardWithAdditionalGSPInfo, dispatch } = build();

    forwardWithAdditionalGSPInfo({
      isConcessionaireOfPublicService: { choice: true, textFieldValue: 'concession' },
      fromBelongsRegulatedMarket: { choice: false, textFieldValue: 'market' },
      isEstabilishedRegulatoryProvision: { choice: true, textFieldValue: 'provision' },
      isFromIPA: { choice: true, textFieldValue: 'ipa-code' },
    } as any);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ADDITIONAL_INFO_SUBMITTED',
      additionalInformations: {
        agentOfPublicService: true,
        agentOfPublicServiceNote: 'concession',
        belongRegulatedMarket: false,
        regulatedMarketNote: 'market',
        establishedByRegulatoryProvision: true,
        establishedByRegulatoryProvisionNote: 'provision',
        ipa: true,
        ipaCode: 'ipa-code',
        otherNote: '',
      },
    });
  });

  test('forwardWithAdditionalGPUInfo keeps only the GPU informations fields', () => {
    const { forwardWithAdditionalGPUInfo, dispatch } = build();
    const gpuInformations = {
      businessRegisterNumber: 'BRN',
      legalRegisterNumber: 'LRN',
      legalRegisterName: 'LRName',
      longTermPayments: true,
      manager: true,
      managerAuthorized: true,
      managerEligible: false,
      managerProsecution: false,
      institutionCourtMeasures: false,
    } as AdditionalGpuInformations;

    forwardWithAdditionalGPUInfo({ ...gpuInformations, extra: 'dropped' } as any);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'ADDITIONAL_GPU_INFO_SUBMITTED',
      additionalGPUInformations: gpuInformations,
    });
  });
});

describe('users steps', () => {
  const managerData = { users: [loggedUser] } as unknown as Partial<FormData>;

  test('forwardFromManager tracks the manager and merges the users', () => {
    const { forwardFromManager, dispatch, reduce } = build({ activeStep: 'manager' });

    forwardFromManager(managerData);

    expect(trackEvent).toHaveBeenCalledWith('ONBOARDING_ADD_MANAGER', {
      request_id: REQUEST_ID,
      party_id: 'ext-id',
      product_id: PRODUCT_ID,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'USERS_SUBMITTED',
      from: 'manager',
      formData: managerData,
    });
    expect(reduce()).toMatchObject({ activeStep: 'admins', formData: managerData });
  });

  test.each([
    ['the logged user is among the users', [loggedUser], false, true, 'admins'],
    ['the users are unknown', undefined, false, true, 'admins'],
    ['the logged user is not among the users', [otherUser], false, false, 'applicantEmail'],
    ['the party is an aggregator', [loggedUser], true, false, 'aggregates'],
  ])('forwardFromAdmin when %s: submit=%s', (_, users, isAggregator, submitted, step) => {
    const { forwardFromAdmin, dispatch, onSubmit, reduce } = build({
      activeStep: 'admins',
      formData: { previous: 'data' } as unknown as Partial<FormData>,
      onboardingFormData: { isAggregator } as OnboardingFormData,
    });
    const newFormData = (users ? { users } : {}) as unknown as Partial<FormData>;

    forwardFromAdmin(newFormData);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'USERS_SUBMITTED',
      from: 'admins',
      formData: newFormData,
      loggedUserTaxCode: LOGGED_TAX_CODE,
    });
    if (submitted) {
      expect(onSubmit).toHaveBeenCalledWith({ previous: 'data', ...newFormData });
    } else {
      expect(onSubmit).not.toHaveBeenCalled();
    }
    expect(reduce().activeStep).toBe(step);
  });

  const aggregates = [{ taxCode: '11111111111' }] as Array<AggregateInstitution>;

  test('forwardFromAggregator moves to the applicant email when the logged user is not a user', () => {
    const { forwardFromAggregator, dispatch, onSubmit, reduce } = build({
      activeStep: 'aggregates',
      loading: true,
      formData: { users: [otherUser] } as unknown as Partial<FormData>,
    });

    forwardFromAggregator(undefined, aggregates);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'AGGREGATES_SUBMITTED',
      aggregates,
      loggedUserTaxCode: LOGGED_TAX_CODE,
    });
    expect(reduce()).toMatchObject({
      activeStep: 'applicantEmail',
      aggregatesData: aggregates,
      loading: false,
    });
  });

  test('forwardFromAggregator submits with the aggregates when the logged user is a user', () => {
    const { forwardFromAggregator, dispatch, onSubmit } = build({
      activeStep: 'aggregates',
      formData: { users: [loggedUser] } as unknown as Partial<FormData>,
    });

    forwardFromAggregator(undefined, aggregates);

    expect(onSubmit).toHaveBeenCalledWith(undefined, aggregates);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('forwardFromApplicantEmail records the requester and submits with the aggregates', () => {
    const onboardingFormData = { businessName: 'Comune di Roma' } as OnboardingFormData;
    const userRequester = { name: 'Logged', surname: 'User', email: 'a@b.it' } as UserRequester;
    const { forwardFromApplicantEmail, dispatch, onSubmit, reduce } = build({
      activeStep: 'applicantEmail',
      onboardingFormData,
      aggregatesData: aggregates,
    });

    forwardFromApplicantEmail(userRequester);

    const updated = { ...onboardingFormData, userRequester };
    expect(dispatch).toHaveBeenCalledWith({ type: 'APPLICANT_EMAIL_SUBMITTED', userRequester });
    expect(onSubmit).toHaveBeenCalledWith(undefined, aggregates, updated);
    expect(reduce().onboardingFormData).toEqual(updated);
  });
});
