import { describe, expect, it } from 'vitest';
import { OnboardingControllers } from '../../../../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../../../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../../../../utils/constants';
import {
  getPartyGeneralLayout,
  getSubunitFields,
  PartyGeneralLayoutParams,
} from '../partyGeneralDataLayout';

const controllers: OnboardingControllers = {
  isPremium: false,
  isDisabled: false,
  isInvoiceable: true,
  isForeignInsurance: false,
  isFromIPA: false,
  isAooUo: false,
  isCityEditable: true,
};

const formData = (overrides: Partial<OnboardingFormData> = {}): OnboardingFormData => ({
  businessName: '',
  registeredOffice: '',
  digitalAddress: '',
  geographicTaxonomies: [],
  ...overrides,
});

const layoutOf = (overrides: Partial<PartyGeneralLayoutParams> = {}) =>
  getPartyGeneralLayout({
    controllers,
    institutionType: 'PA',
    isInfoCompany: false,
    productId: PRODUCT_IDS.SEND,
    ...overrides,
  });

describe('getSubunitFields', () => {
  it('returns the UO fields, even when an AOO code is also set', () => {
    expect(getSubunitFields({ uoUniqueCode: 'UO1', aooUniqueCode: 'AOO1' })).toEqual({
      name: { field: 'uoName', labelKey: 'onboardingFormData.billingDataSection.uoName' },
      code: {
        field: 'uoUniqueCode',
        labelKey: 'onboardingFormData.billingDataSection.uoUniqueCode',
      },
    });
  });

  it('returns the AOO fields', () => {
    expect(getSubunitFields({ aooUniqueCode: 'AOO1' })?.name.field).toBe('aooName');
  });

  it('returns nothing without subunit', () => {
    expect(getSubunitFields(undefined)).toBeUndefined();
    expect(getSubunitFields({})).toBeUndefined();
  });
});

describe('getPartyGeneralLayout', () => {
  it('enables every field for a default party', () => {
    expect(layoutOf()).toEqual({
      subunitFields: undefined,
      isBusinessNameDisabled: false,
      isAddressDisabled: false,
      isForeignInsuranceCompany: false,
      isCityAutocompleteDisabled: false,
      isCityLocked: false,
      showCityPopupIcon: true,
      isDigitalAddressDisabled: false,
      showTaxCode: true,
      isTaxCodeDisabled: false,
    });
  });

  it('disables the fields when controllers.isDisabled is true', () => {
    expect(layoutOf({ controllers: { ...controllers, isDisabled: true } })).toMatchObject({
      isBusinessNameDisabled: true,
      isAddressDisabled: true,
      isDigitalAddressDisabled: true,
      isTaxCodeDisabled: true,
    });
  });

  const lockedCases: Array<[string, Partial<PartyGeneralLayoutParams>]> = [
    ['SA', { institutionType: 'SA' }],
    [
      'PRV + prod-idpay-merchant',
      { institutionType: 'PRV', productId: PRODUCT_IDS.IDPAY_MERCHANT },
    ],
  ];

  it.each(lockedCases)('locks business name, pec and tax code for %s', (_label, overrides) => {
    expect(layoutOf(overrides)).toMatchObject({
      isBusinessNameDisabled: true,
      isDigitalAddressDisabled: true,
      isTaxCodeDisabled: true,
    });
  });

  it('locks only the info company fields already filled', () => {
    expect(
      layoutOf({
        institutionType: 'PRV',
        productId: PRODUCT_IDS.PAGOPA,
        isInfoCompany: true,
        onboardingFormData: formData({ businessName: 'Company srl', taxCode: '12345678901' }),
      })
    ).toMatchObject({
      isBusinessNameDisabled: true,
      isDigitalAddressDisabled: false,
      isTaxCodeDisabled: true,
    });
  });

  it('handles a foreign insurance company without tax code', () => {
    expect(
      layoutOf({
        institutionType: 'AS',
        controllers: { ...controllers, isForeignInsurance: true, isDisabled: true },
        onboardingFormData: formData({ taxCode: '' }),
      })
    ).toMatchObject({
      isForeignInsuranceCompany: true,
      isAddressDisabled: false,
      showTaxCode: false,
    });
  });

  it.each([
    [
      'from IPA',
      { isFromIPA: true },
      { isCityAutocompleteDisabled: true, isCityLocked: true, showCityPopupIcon: false },
    ],
    [
      'AOO/UO',
      { isAooUo: true },
      { isCityAutocompleteDisabled: true, isCityLocked: true, showCityPopupIcon: true },
    ],
    [
      'premium',
      { isPremium: true },
      { isCityAutocompleteDisabled: true, isCityLocked: false, showCityPopupIcon: true },
    ],
    [
      'city not editable',
      { isCityEditable: false },
      { isCityAutocompleteDisabled: false, isCityLocked: true, showCityPopupIcon: false },
    ],
  ])('city autocomplete when %s', (_label, controllerOverrides, expected) => {
    expect(layoutOf({ controllers: { ...controllers, ...controllerOverrides } })).toMatchObject(
      expected
    );
  });
});
