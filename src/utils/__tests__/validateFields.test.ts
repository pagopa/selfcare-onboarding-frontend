import { OnboardingControllers } from '../../hooks/useOnboardingControllers';
import { OnboardingFormData } from '../../model/OnboardingFormData';
import { PRODUCT_IDS } from '../constants';
import {
  isAddressDisabled,
  isBusinessNameDisabled,
  isDigitalAddressDisabled,
  isFieldLockedForPrivate,
  isPecEmail,
  isTaxCodeFieldDisabled,
  showCommercialRegisterSection,
  showTaxCodeField,
} from '../validateFields';

const controllers = (overrides: Partial<OnboardingControllers> = {}): OnboardingControllers => ({
  isPremium: false,
  isInvoiceable: false,
  isForeignInsurance: false,
  isDisabled: false,
  isFromIPA: false,
  isAooUo: false,
  ...overrides,
});

const formData = (overrides: Partial<OnboardingFormData> = {}) =>
  ({
    businessName: 'Acme',
    digitalAddress: 'acme@pec.it',
    taxCode: '12345678901',
    ...overrides,
  }) as OnboardingFormData;

describe('validateFields helpers', () => {
  describe('isPecEmail', () => {
    test.each(['a@pec.it', 'a@sub.pec.it', 'A@PEC.IT'])('%s is a PEC', (email) => {
      expect(isPecEmail(email)).toBe(true);
    });

    test.each(['a@gmail.com', 'pec@example.it'])('%s is not a PEC', (email) => {
      expect(isPecEmail(email)).toBe(false);
    });
  });

  describe.each([
    ['isBusinessNameDisabled', isBusinessNameDisabled, 'businessName'],
    ['isDigitalAddressDisabled', isDigitalAddressDisabled, 'digitalAddress'],
    ['isTaxCodeFieldDisabled', isTaxCodeFieldDisabled, 'taxCode'],
  ] as const)('%s', (_name, fn, field) => {
    test('enabled by default', () => {
      expect(fn(controllers(), 'PA', false, formData())).toBeFalsy();
    });

    test('disabled when controllers.isDisabled', () => {
      expect(fn(controllers({ isDisabled: true }), 'PA', false)).toBe(true);
    });

    test('disabled for contracting authority (SA)', () => {
      expect(fn(controllers(), 'SA', false)).toBe(true);
    });

    test('disabled for insurance company (AS)', () => {
      expect(fn(controllers(), 'AS', false)).toBe(true);
    });

    test('disabled for info company only when the field is valued', () => {
      expect(fn(controllers(), 'GSP', true, formData())).toBe(true);
      expect(fn(controllers(), 'GSP', true,       formData({ [field]: '' }))).toBeFalsy();
            expect(fn(controllers(), 'GSP', true, undefined)).toBeFalsy();
    });

    test('disabled when locked for private', () => {
      expect(fn(controllers(), 'PRV', false, formData(), true)).toBe(true);
    });
  });

  describe('isAddressDisabled', () => {
    test('disabled when controllers.isDisabled and not AooUo', () => {
      expect(isAddressDisabled(controllers({ isDisabled: true }), 'PA')).toBe(true);
    });

    test('enabled when not disabled', () => {
      expect(isAddressDisabled(controllers(), 'PA')).toBe(false);
    });

    test('enabled for AooUo', () => {
      expect(isAddressDisabled(controllers({ isDisabled: true, isAooUo: true }), 'PA')).toBe(
        false
      );
    });

    test('enabled for insurance company', () => {
      expect(isAddressDisabled(controllers({ isDisabled: true }), 'AS')).toBe(false);
    });
  });

  describe('showTaxCodeField', () => {
    test('shown for non-insurance types', () => {
      expect(showTaxCodeField('PA')).toBe(true);
    });

    test('hidden for insurance without tax code', () => {
      expect(showTaxCodeField('AS')).toBe(false);
      expect(showTaxCodeField('AS', formData({ taxCode: '' }))).toBe(false);
    });

    test('shown for insurance with tax code', () => {
      expect(showTaxCodeField('AS', formData())).toBe(true);
    });
  });

  describe('isFieldLockedForPrivate', () => {
    test('locked for PRV and PRV_PF on generic products', () => {
      expect(isFieldLockedForPrivate('PRV', PRODUCT_IDS.IO)).toBe(true);
      expect(isFieldLockedForPrivate('PRV_PF', undefined)).toBe(true);
    });

    test('not locked for pagoPA and CED', () => {
      expect(isFieldLockedForPrivate('PRV', PRODUCT_IDS.PAGOPA)).toBe(false);
      expect(isFieldLockedForPrivate('PRV', PRODUCT_IDS.CED)).toBe(false);
    });

    test('not locked for non-private types', () => {
      expect(isFieldLockedForPrivate('PA', PRODUCT_IDS.IO)).toBe(false);
    });
  });

  describe('showCommercialRegisterSection', () => {
    test('shown for info company', () => {
      expect(showCommercialRegisterSection(true, 'GSP', PRODUCT_IDS.IO)).toBe(true);
    });

    test('shown for contracting authority', () => {
      expect(showCommercialRegisterSection(false, 'SA', PRODUCT_IDS.IO)).toBe(true);
    });

    test.each([
      PRODUCT_IDS.INTEROP,
      PRODUCT_IDS.PAGOPA,
      PRODUCT_IDS.IDPAY_MERCHANT,
      PRODUCT_IDS.CED,
    ])('shown for SCP, PRV, PRV_PF, GPU on %s', (productId) => {
      ['SCP', 'PRV', 'PRV_PF', 'GPU'].forEach((type) =>
        expect(showCommercialRegisterSection(false, type as any, productId)).toBe(true)
      );
    });

    test('hidden for those types on other products', () => {
      expect(showCommercialRegisterSection(false, 'PRV', PRODUCT_IDS.IO)).toBe(false);
    });

    test('hidden for PA even on enabled products', () => {
      expect(showCommercialRegisterSection(false, 'PA', PRODUCT_IDS.PAGOPA)).toBe(false);
    });
  });
});
