import { describe, expect, test, vi } from 'vitest';
import { RequestOutcomeMessage } from '../../../../../types';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { selected2OnboardingData } from '../../../../utils/selected2OnboardingData';
import {
  createInitialState,
  emptyBillingData,
  onboardingProductReducer,
  OnboardingProductAction,
  OnboardingProductState,
  UploadDocumentsContext,
} from '../onboardingProductReducer';

const LOGGED = 'RSSMRA80A01H501U';

const billing = (overrides: Partial<OnboardingFormData> = {}): OnboardingFormData => ({
  ...emptyBillingData(),
  businessName: 'Comune di Milano',
  taxCode: '01199250158',
  ...overrides,
});

const reduce = (state: OnboardingProductState, action: OnboardingProductAction) =>
  onboardingProductReducer(state, action);

const outcome: RequestOutcomeMessage = { title: 'done', description: [] };

describe('createInitialState', () => {
  test('starts on the institution type step with loading on', () => {
    expect(createInitialState()).toEqual({
      activeStep: 'institutionType',
      loading: true,
      externalInstitutionId: '',
      categoriesLoaded: false,
      openExitModal: false,
      uploadDocumentsContext: null,
    });
  });

  test('applies the overrides', () => {
    expect(createInitialState({ activeStep: 'manager', loading: false })).toMatchObject({
      activeStep: 'manager',
      loading: false,
    });
  });
});

describe('selection actions', () => {
  describe('INSTITUTION_TYPE_SELECTED', () => {
    test('a searchable type goes to the party search keeping the billing data', () => {
      const previous = billing();
      const state = reduce(createInitialState({ onboardingFormData: previous }), {
        type: 'INSTITUTION_TYPE_SELECTED',
        institutionType: 'PA',
        productId: 'prod-io',
      });
      expect(state).toMatchObject({ institutionType: 'PA', activeStep: 'searchParty' });
      expect(state.onboardingFormData).toBe(previous);
    });

    test('a private institution on prod-pagopa goes to billing with prefilled empty data', () => {
      const state = reduce(createInitialState(), {
        type: 'INSTITUTION_TYPE_SELECTED',
        institutionType: 'PRV',
        productId: 'prod-pagopa',
      });
      expect(state.activeStep).toBe('billingData');
      expect(state.onboardingFormData).toEqual(
        selected2OnboardingData(null, undefined, 'PRV', 'prod-pagopa')
      );
    });

    test('a type without search changing type resets the billing data', () => {
      const state = reduce(
        createInitialState({ institutionType: 'PSP', onboardingFormData: billing() }),
        { type: 'INSTITUTION_TYPE_SELECTED', institutionType: 'PT', productId: 'prod-pagopa' }
      );
      expect(state).toMatchObject({ institutionType: 'PT', activeStep: 'billingData' });
      expect(state.onboardingFormData).toEqual(emptyBillingData());
    });

    test('a type without search selected again keeps the billing data', () => {
      const previous = billing();
      const state = reduce(
        createInitialState({ institutionType: 'PSP', onboardingFormData: previous }),
        { type: 'INSTITUTION_TYPE_SELECTED', institutionType: 'PSP', productId: 'prod-pagopa' }
      );
      expect(state.activeStep).toBe('billingData');
      expect(state.onboardingFormData).toBe(previous);
    });
  });

  describe('PARTY_SELECTED', () => {
    const start = createInitialState({ activeStep: 'searchParty', origin: 'SELC' });

    test('stores the party, merges it into the form data and goes to the verification', () => {
      const party = billing({ externalId: 'ext-1', origin: 'IPA', originId: 'c_f205' });
      const state = reduce(
        { ...start, formData: { users: [] } as unknown as Partial<FormData> },
        { type: 'PARTY_SELECTED', party, institutionType: 'PA', gspNoIpaEnabled: false }
      );
      expect(state).toMatchObject({
        activeStep: 'verifyOnboarding',
        institutionType: 'PA',
        externalInstitutionId: 'ext-1',
        origin: 'IPA',
        onboardingFormData: party,
        formData: { users: [], ...party },
      });
    });

    test('a GSP with originId has IPA origin', () => {
      const state = reduce(start, {
        type: 'PARTY_SELECTED',
        party: billing({ externalId: 'ext-1', originId: 'gsp-1', origin: 'ANAC' }),
        institutionType: 'GSP',
        gspNoIpaEnabled: true,
      });
      expect(state.origin).toBe('IPA');
    });

    test('keeps the current origin when the party has none', () => {
      const state = reduce(start, {
        type: 'PARTY_SELECTED',
        party: billing({ externalId: 'ext-1' }),
        institutionType: 'PA',
        gspNoIpaEnabled: false,
      });
      expect(state.origin).toBe('SELC');
    });

    test('a GSP without IPA goes to the contracts summary when NO_IPA is on', () => {
      const state = reduce(start, {
        type: 'PARTY_SELECTED',
        party: billing({ taxCode: '' }),
        institutionType: 'GSP',
        gspNoIpaEnabled: true,
      });
      expect(state).toEqual({ ...start, activeStep: 'contractsSummary' });
    });

    test('a GSP without IPA goes to the onboardingData pass-through when NO_IPA is off', () => {
      const state = reduce(
        { ...start, externalInstitutionId: 'old', onboardingFormData: billing() },
        {
          type: 'PARTY_SELECTED',
          party: billing({ taxCode: '' }),
          institutionType: 'GSP',
          gspNoIpaEnabled: false,
        }
      );
      expect(state).toMatchObject({
        activeStep: 'onboardingData',
        origin: 'SELC',
        externalInstitutionId: '',
        onboardingFormData: emptyBillingData(),
      });
    });
  });

  test('GSP_NO_IPA_SELECTED from the contracts summary goes to billing with empty data', () => {
    const state = reduce(createInitialState({ activeStep: 'contractsSummary' }), {
      type: 'GSP_NO_IPA_SELECTED',
      from: 'contractsSummary',
    });
    expect(state).toMatchObject({
      activeStep: 'billingData',
      origin: 'SELC',
      externalInstitutionId: '',
      onboardingFormData: emptyBillingData(),
    });
  });
});

describe('data actions', () => {
  test('ONBOARDING_DATA_LOADED stores data and type and goes to billing', () => {
    const data = billing();
    const state = reduce(createInitialState({ activeStep: 'onboardingData' }), {
      type: 'ONBOARDING_DATA_LOADED',
      onboardingFormData: data,
      institutionType: 'PA',
    });
    expect(state).toMatchObject({
      activeStep: 'billingData',
      onboardingFormData: data,
      institutionType: 'PA',
    });
  });

  test('ONBOARDING_DATA_LOADED without data keeps the billing data and clears the type', () => {
    const previous = billing();
    const state = reduce(
      createInitialState({ institutionType: 'GSP', onboardingFormData: previous }),
      { type: 'ONBOARDING_DATA_LOADED' }
    );
    expect(state.onboardingFormData).toBe(previous);
    expect(state.institutionType).toBeUndefined();
    expect(state.activeStep).toBe('billingData');
  });

  test.each([
    ['GSP', 'IPA', undefined, 'manager'],
    ['GSP', undefined, 'IPA', 'manager'],
    ['GSP', 'SELC', 'SELC', 'additionalInfo'],
    ['GPU', 'SELC', undefined, 'additionalGpuInfo'],
    ['PT', 'SELC', undefined, 'admins'],
    ['PA', 'IPA', undefined, 'manager'],
  ] as const)(
    'BILLING_DATA_SUBMITTED for %s (billing origin %s, current %s) goes to %s',
    (institutionType, billingOrigin, currentOrigin, expected) => {
      const data = billing({ origin: billingOrigin });
      const state = reduce(
        createInitialState({ activeStep: 'billingData', institutionType, origin: currentOrigin }),
        { type: 'BILLING_DATA_SUBMITTED', onboardingFormData: data }
      );
      expect(state.activeStep).toBe(expected);
      expect(state.onboardingFormData).toBe(data);
    }
  );

  test('ADDITIONAL_INFO_SUBMITTED stores the info and goes to the manager', () => {
    const additionalInformations = {
      agentOfPublicService: false,
      agentOfPublicServiceNote: '',
      belongRegulatedMarket: false,
      regulatedMarketNote: '',
      establishedByRegulatoryProvision: false,
      establishedByRegulatoryProvisionNote: '',
      ipa: true,
      ipaCode: 'c_f205',
      otherNote: '',
    };
    const state = reduce(createInitialState({ activeStep: 'additionalInfo' }), {
      type: 'ADDITIONAL_INFO_SUBMITTED',
      additionalInformations,
    });
    expect(state).toMatchObject({ activeStep: 'manager', additionalInformations });
  });

  test('ADDITIONAL_GPU_INFO_SUBMITTED stores the info and goes to the manager', () => {
    const additionalGPUInformations = {
      businessRegisterNumber: '123',
      legalRegisterNumber: '',
      legalRegisterName: '',
      longTermPayments: false,
      manager: true,
      managerAuthorized: true,
      managerEligible: true,
      managerProsecution: false,
      institutionCourtMeasures: false,
    };
    const state = reduce(createInitialState({ activeStep: 'additionalGpuInfo' }), {
      type: 'ADDITIONAL_GPU_INFO_SUBMITTED',
      additionalGPUInformations,
    });
    expect(state).toMatchObject({ activeStep: 'manager', additionalGPUInformations });
  });
});

describe('users actions', () => {
  const manager = { taxCode: 'MNGMRA80A01H501U', role: 'MANAGER' };
  const logged = { taxCode: LOGGED, role: 'DELEGATE' };
  const withUsers = (users: Array<object>) => ({ users }) as unknown as Partial<FormData>;

  test('USERS_SUBMITTED from the manager merges the users and goes to the admins', () => {
    const state = reduce(
      createInitialState({
        activeStep: 'manager',
        formData: { externalId: 'ext-1' } as unknown as Partial<FormData>,
      }),
      { type: 'USERS_SUBMITTED', from: 'manager', formData: withUsers([manager]) }
    );
    expect(state.activeStep).toBe('admins');
    expect(state.formData).toEqual({ externalId: 'ext-1', users: [manager] });
  });

  test.each([
    ['an aggregator', true, [manager, logged], 'aggregates'],
    ['the logged user not among users', false, [manager], 'applicantEmail'],
    ['the logged user among users (submit)', false, [manager, logged], 'admins'],
  ] as const)(
    'USERS_SUBMITTED from the admins with %s goes to %s',
    (_label, isAggregator, users, expected) => {
      const state = reduce(
        createInitialState({
          activeStep: 'admins',
          onboardingFormData: billing({ isAggregator }),
        }),
        {
          type: 'USERS_SUBMITTED',
          from: 'admins',
          formData: withUsers([...users]),
          loggedUserTaxCode: LOGGED,
        }
      );
      expect(state.activeStep).toBe(expected);
      expect(state.formData).toEqual({ users });
    }
  );

  test('AGGREGATES_SUBMITTED asks the applicant email releasing the loading', () => {
    const aggregates = [{ taxCode: '1', description: 'Comune' }] as any;
    const state = reduce(
      createInitialState({
        activeStep: 'aggregates',
        loading: true,
        formData: withUsers([manager]),
      }),
      { type: 'AGGREGATES_SUBMITTED', aggregates, loggedUserTaxCode: LOGGED }
    );
    expect(state).toMatchObject({
      activeStep: 'applicantEmail',
      aggregatesData: aggregates,
      loading: false,
    });
  });

  test('AGGREGATES_SUBMITTED leaves the state untouched when the onboarding is submitted', () => {
    const start = createInitialState({
      activeStep: 'aggregates',
      formData: withUsers([manager, logged]),
    });
    expect(
      reduce(start, { type: 'AGGREGATES_SUBMITTED', aggregates: [], loggedUserTaxCode: LOGGED })
    ).toBe(start);
  });

  test('APPLICANT_EMAIL_SUBMITTED adds the requester to the billing data', () => {
    const userRequester = { name: 'Mario', surname: 'Rossi', email: 'mario@rossi.it' };
    const state = reduce(
      createInitialState({ activeStep: 'applicantEmail', onboardingFormData: billing() }),
      { type: 'APPLICANT_EMAIL_SUBMITTED', userRequester }
    );
    expect(state.activeStep).toBe('applicantEmail');
    expect(state.onboardingFormData).toEqual({ ...billing(), userRequester });
  });

  test('GO_TO_STEP moves to the given step', () => {
    expect(reduce(createInitialState(), { type: 'GO_TO_STEP', step: 'admins' }).activeStep).toBe(
      'admins'
    );
  });
});

describe('UI actions', () => {
  test.each([
    [{ type: 'SET_LOADING', loading: false }, { loading: false }],
    [{ type: 'SET_LOADING', loading: (prev: boolean) => !prev }, { loading: false }],
    [{ type: 'SET_OUTCOME', outcome }, { outcome }],
    [{ type: 'SET_OUTCOME', outcome: null }, { outcome: null }],
    [
      { type: 'PRODUCT_LOADED', product: { id: 'prod-io' } },
      { selectedProduct: { id: 'prod-io' } },
    ],
    [{ type: 'PRODUCT_LOADED', product: null }, { selectedProduct: null }],
    [{ type: 'PRICING_PLAN_LOADED', pricingPlan: 'FA' }, { pricingPlan: 'FA' }],
    [{ type: 'SET_INSTITUTION_TYPE', institutionType: 'GSP' }, { institutionType: 'GSP' }],
    [{ type: 'SET_ORIGIN', origin: 'SELC' }, { origin: 'SELC' }],
    [{ type: 'CATEGORIES_LOADING' }, { categoriesLoaded: false }],
    [
      { type: 'FILTER_CATEGORIES_RECEIVED', response: { product: {} } },
      { filterCategoriesResponse: { product: {} } },
    ],
    [{ type: 'CATEGORIES_LOADED' }, { categoriesLoaded: true }],
    [{ type: 'SET_EXIT_MODAL_OPEN', open: true }, { openExitModal: true }],
    [{ type: 'CLOSE_EXIT_MODAL' }, { openExitModal: false, onExitAction: undefined }],
  ] as Array<[OnboardingProductAction, Partial<OnboardingProductState>]>)(
    '%o',
    (action, expected) => {
      expect(reduce(createInitialState(), action)).toMatchObject(expected);
    }
  );

  test('SET_INSTITUTION_TYPE and SET_ORIGIN accept updaters', () => {
    const state = createInitialState({ institutionType: 'PA', origin: 'IPA' });
    expect(
      reduce(state, { type: 'SET_INSTITUTION_TYPE', institutionType: (prev) => prev ?? 'PT' })
        .institutionType
    ).toBe('PA');
    expect(reduce(state, { type: 'SET_ORIGIN', origin: (prev) => `${prev}-x` }).origin).toBe(
      'IPA-x'
    );
  });

  test('SET_EXIT_ACTION stores the function returned by the updater, like setState', () => {
    const goBack = vi.fn();
    const state = reduce(createInitialState(), {
      type: 'SET_EXIT_ACTION',
      onExitAction: () => goBack,
    });
    expect(state.onExitAction).toBe(goBack);
    expect(goBack).not.toHaveBeenCalled();
  });

  test('OPEN_EXIT_MODAL opens the modal storing the exit action without calling it', () => {
    const goBack = vi.fn();
    const state = reduce(createInitialState(), { type: 'OPEN_EXIT_MODAL', onExitAction: goBack });
    expect(state).toMatchObject({ openExitModal: true, onExitAction: goBack });
    expect(goBack).not.toHaveBeenCalled();
  });

  test('CLOSE_EXIT_MODAL closes the modal and forgets the exit action', () => {
    const state = reduce(createInitialState({ openExitModal: true, onExitAction: vi.fn() }), {
      type: 'CLOSE_EXIT_MODAL',
    });
    expect(state.openExitModal).toBe(false);
    expect(state.onExitAction).toBeUndefined();
  });

  describe('upload documents', () => {
    const context: UploadDocumentsContext = {
      onboardingId: 'onb-1',
      productId: 'prod-pagopa',
      institutionType: 'GSP',
      origin: 'SELC',
    };

    test('OPEN_UPLOAD_DOCUMENTS stores the context', () => {
      expect(
        reduce(createInitialState(), { type: 'OPEN_UPLOAD_DOCUMENTS', context })
          .uploadDocumentsContext
      ).toBe(context);
    });

    test('UPLOAD_DOCUMENTS_BACK closes the flow on the admins step', () => {
      const state = reduce(
        createInitialState({ activeStep: 'applicantEmail', uploadDocumentsContext: context }),
        { type: 'UPLOAD_DOCUMENTS_BACK' }
      );
      expect(state).toMatchObject({ uploadDocumentsContext: null, activeStep: 'admins' });
    });

    test('UPLOAD_DOCUMENTS_COMPLETED closes the flow with the outcome', () => {
      const state = reduce(createInitialState({ uploadDocumentsContext: context }), {
        type: 'UPLOAD_DOCUMENTS_COMPLETED',
        outcome,
      });
      expect(state).toMatchObject({ uploadDocumentsContext: null, outcome });
    });
  });

  test('an unknown action returns the same state', () => {
    const state = createInitialState();
    expect(reduce(state, { type: 'UNKNOWN' } as unknown as OnboardingProductAction)).toBe(state);
  });
});
