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
  goTo,
  requiresApplicantEmail,
  SelectedParty,
  stay,
  submit,
  Transition,
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
