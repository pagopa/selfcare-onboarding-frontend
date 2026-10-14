import { describe, expect, test } from 'vitest';
import { InstitutionType } from '../../../../../types';
import { ONBOARDING_STEPS, OnboardingStepName, stepIndex, stepName } from '../onboardingSteps';
import {
  afterAdditionalGpuInfo,
  afterAdditionalInfo,
  afterAdmins,
  afterAggregates,
  afterApplicantEmail,
  afterBillingData,
  afterGspNoIpa,
  afterInstitutionType,
  afterManager,
  afterOnboardingData,
  afterPartySelection,
  afterVerifyOnboarding,
  backFromAdditionalGpuInfo,
  backFromAdditionalInfo,
  backFromAdmins,
  backFromAggregates,
  backFromApplicantEmail,
  backFromBillingData,
  backFromContractsSummary,
  backFromInstitutionType,
  backFromManager,
  backFromSearchParty,
  backFromUploadDocuments,
  goTo,
  openExitModal,
  requiresApplicantEmail,
  SelectedParty,
  stay,
  submit,
  Transition,
  TransitionContext,
} from '../onboardingTransitions';

/** Asserts the named target is the same step the legacy `activeStep + offset` navigation reached. */
const expectLegacyTarget = (
  transition: Transition,
  from: OnboardingStepName,
  legacyOffset: number
) => {
  expect(transition.kind).toBe('goTo');
  if (transition.kind === 'goTo') {
    expect(stepIndex(transition.step)).toBe(stepIndex(from) + legacyOffset);
  }
};

describe('onboardingSteps', () => {
  test('keeps the order of the rendered steps array', () => {
    expect(ONBOARDING_STEPS).toEqual([
      'institutionType',
      'searchParty',
      'contractsSummary',
      'verifyOnboarding',
      'onboardingData',
      'billingData',
      'additionalGpuInfo',
      'additionalInfo',
      'manager',
      'admins',
      'aggregates',
      'applicantEmail',
    ]);
  });

  test('stepIndex and stepName are inverse', () => {
    ONBOARDING_STEPS.forEach((name, index) => {
      expect(stepIndex(name)).toBe(index);
      expect(stepName(index)).toBe(name);
    });
    expect(stepName(ONBOARDING_STEPS.length)).toBeUndefined();
  });
});

describe('forward transitions', () => {
  describe('afterInstitutionType', () => {
    test.each<[InstitutionType, string, OnboardingStepName]>([
      ['PA', 'prod-io', 'searchParty'],
      ['GSP', 'prod-pagopa', 'searchParty'],
      ['SA', 'prod-interop', 'searchParty'],
      ['AS', 'prod-interop', 'searchParty'],
      ['SCP', 'prod-pagopa', 'searchParty'],
      ['SCEC', 'prod-interop', 'searchParty'],
      ['PRV', 'prod-io', 'searchParty'],
      ['PRV', 'prod-pagopa', 'billingData'],
      ['PRV', 'prod-ced', 'billingData'],
      ['PSP', 'prod-pagopa', 'billingData'],
      ['PT', 'prod-pagopa', 'billingData'],
      ['GPU', 'prod-pagopa', 'billingData'],
      ['PRV_PF', 'prod-pagopa', 'billingData'],
    ])('%s on %s goes to %s', (institutionType, productId, expected) => {
      expect(afterInstitutionType(institutionType, { productId })).toEqual(goTo(expected));
    });
  });

  describe('afterPartySelection', () => {
    const ipaParty: SelectedParty = {
      taxCode: '00000000000',
      originId: 'c_h501',
      externalId: 'ext',
    };
    const gspNoIpaParty: SelectedParty = { taxCode: '', originId: undefined };

    test.each<
      [string, SelectedParty | undefined, InstitutionType | undefined, boolean, boolean, Transition]
    >([
      ['GSP without IPA, NO_IPA on', gspNoIpaParty, 'GSP', true, false, goTo('contractsSummary')],
      ['GSP without IPA, NO_IPA off', gspNoIpaParty, 'GSP', false, false, goTo('onboardingData')],
      ['GSP from IPA', { ...ipaParty }, 'GSP', true, false, goTo('verifyOnboarding')],
      [
        'GSP with empty tax code but originId',
        { taxCode: '', originId: 'o', externalId: 'ext' },
        'GSP',
        true,
        false,
        goTo('verifyOnboarding'),
      ],
      [
        'PA with empty tax code (not a GSP)',
        { taxCode: '', externalId: 'ext' },
        'PA',
        true,
        false,
        goTo('verifyOnboarding'),
      ],
      ['PA from IPA', ipaParty, 'PA', false, false, goTo('verifyOnboarding')],
      ['party without externalId', { taxCode: 'x' }, 'PA', false, false, stay()],
      ['party without institution type', ipaParty, undefined, false, false, stay()],
      [
        'party without externalId and users already collected',
        { taxCode: 'x' },
        'PA',
        false,
        true,
        goTo('verifyOnboarding'),
      ],
    ])('%s', (_label, party, institutionType, gspNoIpaEnabled, hasFormData, expected) => {
      expect(afterPartySelection(party, institutionType, { gspNoIpaEnabled, hasFormData })).toEqual(
        expected
      );
    });

    test('a party selection skips the contracts summary like the legacy +2', () => {
      expectLegacyTarget(
        afterPartySelection(ipaParty, 'PA', { gspNoIpaEnabled: false, hasFormData: false }),
        'searchParty',
        2
      );
    });

    test('NO_IPA on moves to the contracts summary like the legacy +1', () => {
      expectLegacyTarget(
        afterPartySelection(gspNoIpaParty, 'GSP', { gspNoIpaEnabled: true, hasFormData: false }),
        'searchParty',
        1
      );
    });
  });

  describe('afterGspNoIpa', () => {
    test.each<[OnboardingStepName, OnboardingStepName]>([
      ['searchParty', 'onboardingData'],
      ['contractsSummary', 'billingData'],
    ])('from %s goes to %s (legacy +3)', (from, expected) => {
      const transition = afterGspNoIpa(from);
      expect(transition).toEqual(goTo(expected));
      expectLegacyTarget(transition, from, 3);
    });
  });

  test.each<[string, () => Transition, OnboardingStepName, number]>([
    ['afterVerifyOnboarding', afterVerifyOnboarding, 'verifyOnboarding', 1],
    ['afterOnboardingData', afterOnboardingData, 'onboardingData', 1],
    ['afterAdditionalInfo', afterAdditionalInfo, 'additionalInfo', 1],
    ['afterAdditionalGpuInfo', afterAdditionalGpuInfo, 'additionalGpuInfo', 2],
    ['afterManager', afterManager, 'manager', 1],
  ])('%s matches the legacy offset from %s', (_name, transition, from, offset) => {
    expectLegacyTarget(transition(), from, offset);
  });

  describe('afterBillingData', () => {
    test.each<[InstitutionType | undefined, string | undefined, OnboardingStepName, number]>([
      ['GSP', 'IPA', 'manager', 3],
      ['GSP', 'SELC', 'additionalInfo', 2],
      ['GSP', undefined, 'additionalInfo', 2],
      ['GPU', 'SELC', 'additionalGpuInfo', 1],
      ['PT', 'SELC', 'admins', 4],
      ['PA', 'IPA', 'manager', 3],
      ['SA', 'ANAC', 'manager', 3],
      ['PSP', undefined, 'manager', 3],
      ['PRV', 'SELC', 'manager', 3],
      [undefined, undefined, 'manager', 3],
    ])('%s with origin %s goes to %s', (institutionType, origin, expected, offset) => {
      const transition = afterBillingData({ institutionType, origin });
      expect(transition).toEqual(goTo(expected));
      expectLegacyTarget(transition, 'billingData', offset);
    });
  });

  describe('afterAdmins', () => {
    test.each<[boolean, boolean, Transition]>([
      [true, true, goTo('aggregates')],
      [true, false, goTo('aggregates')],
      [false, true, goTo('applicantEmail')],
      [false, false, submit()],
    ])(
      'aggregator %s, applicant email required %s',
      (isAggregator, isApplicantEmailRequired, expected) => {
        expect(afterAdmins({ isAggregator, isApplicantEmailRequired })).toEqual(expected);
      }
    );

    test('skips the aggregates step like the legacy +2', () => {
      expectLegacyTarget(
        afterAdmins({ isAggregator: false, isApplicantEmailRequired: true }),
        'admins',
        2
      );
    });
  });

  test.each<[boolean, Transition]>([
    [true, goTo('applicantEmail')],
    [false, submit()],
  ])('afterAggregates with applicant email required %s', (isApplicantEmailRequired, expected) => {
    expect(afterAggregates({ isApplicantEmailRequired })).toEqual(expected);
  });

  test('afterApplicantEmail submits', () => {
    expect(afterApplicantEmail()).toEqual(submit());
  });

  describe('requiresApplicantEmail', () => {
    const logged = 'RSSMRA80A01H501U';
    test.each<[string, Array<{ taxCode?: string }> | undefined, string | undefined, boolean]>([
      ['users unknown', undefined, logged, false],
      ['no users', [], logged, true],
      ['logged user among users', [{ taxCode: 'OTHER' }, { taxCode: logged }], logged, false],
      ['logged user not among users', [{ taxCode: 'OTHER' }], logged, true],
      ['logged user without tax code', [{ taxCode: 'OTHER' }], undefined, true],
    ])('%s', (_label, users, loggedTaxCode, expected) => {
      expect(requiresApplicantEmail(users, loggedTaxCode)).toBe(expected);
    });
  });
});

describe('back transitions', () => {
  test('backFromInstitutionType opens the exit modal', () => {
    expect(backFromInstitutionType()).toEqual(openExitModal());
  });

  test('backFromSearchParty goes to the institution type step', () => {
    expect(backFromSearchParty()).toEqual(goTo('institutionType'));
  });

  test.each<[string, () => Transition, OnboardingStepName, number]>([
    ['backFromContractsSummary', backFromContractsSummary, 'contractsSummary', -1],
    ['backFromAdditionalGpuInfo', backFromAdditionalGpuInfo, 'additionalGpuInfo', -1],
    ['backFromAdditionalInfo', backFromAdditionalInfo, 'additionalInfo', -2],
    ['backFromAggregates', backFromAggregates, 'aggregates', -1],
  ])('%s matches the legacy offset from %s', (_name, transition, from, offset) => {
    expectLegacyTarget(transition(), from, offset);
  });

  test('backFromUploadDocuments goes back to the admins step', () => {
    expect(backFromUploadDocuments()).toEqual(goTo('admins'));
  });

  describe('backFromBillingData', () => {
    type BillingCtx = Parameters<typeof backFromBillingData>[0];
    const base: BillingCtx = {
      fromDashboard: false,
      productAvoidStep: false,
      subunitTypeByQuery: '',
      institutionType: 'PA',
      productId: 'prod-io',
      externalInstitutionId: 'ext-1',
      isRequiredDocumentsFlow: false,
    };

    test.each<[string, Partial<BillingCtx>, Transition]>([
      ['from dashboard', { fromDashboard: true }, goTo('institutionType')],
      [
        'from dashboard with the institution type step skipped',
        { fromDashboard: true, productAvoidStep: true },
        openExitModal(),
      ],
      [
        'subunit with the institution type step skipped',
        { subunitTypeByQuery: 'UO', productAvoidStep: true },
        openExitModal(),
      ],
      ['subunit without skipping the step', { subunitTypeByQuery: 'UO' }, goTo('searchParty')],
      [
        'pagoPA insights from dashboard (redirect branch shadowed)',
        { fromDashboard: true, productId: 'prod-dashboard-psp', institutionType: 'PSP' },
        goTo('institutionType'),
      ],
      [
        'pagoPA insights not from dashboard',
        { productId: 'prod-dashboard-psp' },
        goTo('searchParty'),
      ],
      [
        'required documents flow',
        { institutionType: 'GSP', isRequiredDocumentsFlow: true },
        goTo('contractsSummary'),
      ],
      [
        'PSP in the required documents flow',
        { institutionType: 'PSP', isRequiredDocumentsFlow: true },
        goTo('institutionType'),
      ],
      ['no institution type', { institutionType: undefined }, goTo('institutionType')],
    ])('%s', (_label, overrides, expected) => {
      expect(backFromBillingData({ ...base, ...overrides })).toEqual(expected);
    });

    test.each<[InstitutionType, OnboardingStepName]>([
      ['PA', 'searchParty'],
      ['SA', 'searchParty'],
      ['GSP', 'searchParty'],
      ['PRV', 'searchParty'],
      ['PRV_PF', 'searchParty'],
      ['PSP', 'institutionType'],
      ['PT', 'institutionType'],
      ['GPU', 'institutionType'],
      ['AS', 'institutionType'],
      ['SCP', 'institutionType'],
      ['SCEC', 'institutionType'],
    ])('%s goes back to %s', (institutionType, expected) => {
      expect(backFromBillingData({ ...base, institutionType })).toEqual(goTo(expected));
    });
  });

  describe('backFromManager', () => {
    test.each<
      [InstitutionType | undefined, string | undefined, string, OnboardingStepName, number]
    >([
      ['GSP', 'IPA', 'prod-pagopa', 'billingData', -3],
      ['GSP', 'IPA', 'prod-io', 'additionalInfo', -1],
      ['GSP', 'SELC', 'prod-pagopa', 'additionalInfo', -1],
      ['GPU', 'SELC', 'prod-pagopa', 'additionalGpuInfo', -2],
      ['PT', 'SELC', 'prod-pagopa', 'onboardingData', -4],
      ['PA', 'IPA', 'prod-io', 'billingData', -3],
      ['PSP', undefined, 'prod-pagopa', 'billingData', -3],
      [undefined, undefined, 'prod-io', 'billingData', -3],
    ])(
      '%s with origin %s on %s goes back to %s',
      (institutionType, origin, selectedProductId, expected, offset) => {
        const transition = backFromManager({ institutionType, origin, selectedProductId });
        expect(transition).toEqual(goTo(expected));
        expectLegacyTarget(transition, 'manager', offset);
      }
    );
  });

  describe('backFromAdmins', () => {
    test.each<[InstitutionType | undefined, OnboardingStepName, number]>([
      ['PT', 'billingData', -4],
      ['PA', 'manager', -1],
      ['GSP', 'manager', -1],
      [undefined, 'manager', -1],
    ])('%s goes back to %s', (institutionType, expected, offset) => {
      const transition = backFromAdmins({ institutionType });
      expect(transition).toEqual(goTo(expected));
      expectLegacyTarget(transition, 'admins', offset);
    });
  });

  describe('backFromApplicantEmail', () => {
    test.each<[boolean, OnboardingStepName, number]>([
      [true, 'aggregates', -1],
      [false, 'admins', -2],
    ])('aggregator %s goes back to %s', (isAggregator, expected, offset) => {
      const transition = backFromApplicantEmail({ isAggregator });
      expect(transition).toEqual(goTo(expected));
      expectLegacyTarget(transition, 'applicantEmail', offset);
    });
  });

  test('every transition accepts the full context', () => {
    const ctx: TransitionContext = {
      productId: 'prod-io',
      selectedProductId: 'prod-io',
      institutionType: 'PA',
      origin: 'IPA',
      externalInstitutionId: 'ext-1',
      fromDashboard: false,
      productAvoidStep: false,
      subunitTypeByQuery: '',
      isRequiredDocumentsFlow: false,
      isAggregator: false,
      isApplicantEmailRequired: false,
      gspNoIpaEnabled: false,
    };
    expect(backFromBillingData(ctx)).toEqual(goTo('searchParty'));
    expect(backFromManager(ctx)).toEqual(goTo('billingData'));
    expect(afterBillingData(ctx)).toEqual(goTo('manager'));
    expect(afterAdmins(ctx)).toEqual(submit());
  });
});
