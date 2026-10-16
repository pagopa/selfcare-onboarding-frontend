import { describe, expect, test } from 'vitest';
import { PRODUCT_IDS } from '../../../../utils/constants';
import { buildFlowContext, FlowContextInput, getPartyName } from '../flowContext';

const baseInput: FlowContextInput = {
  location: { search: '', hash: '', pathname: '/onboarding/prod-io' },
  productId: PRODUCT_IDS.IO,
  selectedProductId: PRODUCT_IDS.IO,
  institutionType: undefined,
  origin: undefined,
  externalInstitutionId: '',
  onboardingFormData: undefined,
  gspNoIpaEnabled: true,
};

const build = (overrides: Partial<FlowContextInput>) =>
  buildFlowContext({ ...baseInput, ...overrides });

describe('buildFlowContext', () => {
  test('returns neutral values for a plain onboarding URL', () => {
    expect(build({})).toEqual({
      fromDashboard: false,
      productAvoidStep: false,
      subunitTypeByQuery: '',
      subunitCodeByQuery: '',
      institutionTypeByUrl: null,
      addUser: false,
      isRequiredDocumentsFlow: false,
      partyName: '',
    });
  });

  describe('fromDashboard', () => {
    test.each([
      ['no partyExternalId in query', '', '', false],
      ['partyExternalId and no party selected yet', '?partyExternalId=abc', '', true],
      ['partyExternalId matching the selected party', '?partyExternalId=abc', 'abc', true],
      ['partyExternalId different from the selected party', '?partyExternalId=abc', 'xyz', false],
      ['empty partyExternalId', '?partyExternalId=', '', false],
    ])('%s', (_, search, externalInstitutionId, expected) => {
      expect(
        build({ location: { ...baseInput.location, search }, externalInstitutionId }).fromDashboard
      ).toBe(expected);
    });
  });

  describe('productAvoidStep', () => {
    test.each([
      [PRODUCT_IDS.SEND, true],
      [PRODUCT_IDS.IDPAY, true],
      [PRODUCT_IDS.IDPAY_MERCHANT, true],
      [PRODUCT_IDS.IO, false],
      [PRODUCT_IDS.PAGOPA, false],
      [undefined, false],
    ])('selected product %s → %s', (selectedProductId, expected) => {
      expect(build({ selectedProductId }).productAvoidStep).toBe(expected);
    });

    test('depends on the loaded product, not on the route productId', () => {
      expect(
        build({ productId: PRODUCT_IDS.SEND, selectedProductId: undefined }).productAvoidStep
      ).toBe(false);
    });
  });

  test('reads subunit type and code from the hash', () => {
    const ctx = build({
      location: { ...baseInput.location, hash: '#subunitType=AOO&subunitCode=A356E00' },
    });
    expect(ctx.subunitTypeByQuery).toBe('AOO');
    expect(ctx.subunitCodeByQuery).toBe('A356E00');
  });

  test('ignores subunit parameters placed in the search string', () => {
    const ctx = build({
      location: { ...baseInput.location, search: '?subunitType=AOO&subunitCode=A356E00' },
    });
    expect(ctx.subunitTypeByQuery).toBe('');
    expect(ctx.subunitCodeByQuery).toBe('');
  });

  test('reads institutionType from the search string', () => {
    expect(
      build({ location: { ...baseInput.location, search: '?institutionType=PT' } })
        .institutionTypeByUrl
    ).toBe('PT');
  });

  test.each([
    ['/onboarding/prod-io', false],
    ['/onboarding/user', true],
    ['/onboarding/prod-io/user', true],
  ])('addUser for pathname %s → %s', (pathname, expected) => {
    expect(build({ location: { ...baseInput.location, pathname } }).addUser).toBe(expected);
  });

  describe('isRequiredDocumentsFlow', () => {
    const gspOnPagoPa: Partial<FlowContextInput> = {
      productId: PRODUCT_IDS.PAGOPA,
      institutionType: 'GSP',
      origin: 'SELC',
      gspNoIpaEnabled: true,
    };

    test('is true for GSP not from IPA on prod-pagopa with the NO_IPA flag on', () => {
      expect(build(gspOnPagoPa).isRequiredDocumentsFlow).toBe(true);
    });

    test('is true when the origin is not set yet', () => {
      expect(build({ ...gspOnPagoPa, origin: undefined }).isRequiredDocumentsFlow).toBe(true);
    });

    test.each<[string, Partial<FlowContextInput>]>([
      ['the origin is IPA', { origin: 'IPA' }],
      ['the NO_IPA flag is off', { gspNoIpaEnabled: false }],
      ['the product is not prod-pagopa', { productId: PRODUCT_IDS.IO }],
      ['the institution type is not GSP', { institutionType: 'PA' }],
    ])('is false when %s', (_, overrides) => {
      expect(build({ ...gspOnPagoPa, ...overrides }).isRequiredDocumentsFlow).toBe(false);
    });
  });
});

describe('getPartyName', () => {
  test('prefers uoName, then aooName, then businessName', () => {
    expect(getPartyName({ uoName: 'UO', aooName: 'AOO', businessName: 'Ente' } as any)).toBe('UO');
    expect(getPartyName({ aooName: 'AOO', businessName: 'Ente' } as any)).toBe('AOO');
    expect(getPartyName({ businessName: 'Ente' } as any)).toBe('Ente');
  });

  test('returns an empty string when no name is available', () => {
    expect(getPartyName(undefined)).toBe('');
    expect(getPartyName({} as any)).toBe('');
  });

  test('keeps an empty uoName since only nullish values fall through', () => {
    expect(getPartyName({ uoName: '', businessName: 'Ente' } as any)).toBe('');
  });
});
